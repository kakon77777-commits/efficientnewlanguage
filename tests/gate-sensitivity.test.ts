import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';

/**
 * WHAT THE EXECUTION-TRUTH GATE CAN ACTUALLY SEE - the sixteenth measured axis.
 *
 * `tests/interp.test.ts` compares the interpreter against real CPython over the
 * whole corpus. It is the gate everything else leans on. What nothing measured
 * until now is its SENSITIVITY: which behavioural differences it is capable of
 * noticing at all.
 *
 * That is not a hypothetical. On 2026-08-11, drilling that gate with the defect
 * axis 15 was built for - making list binding COPY instead of ALIAS - left it
 * green. The per-process version of the same gate was green too, so the cause
 * was not the rework: no corpus program's stdout depends on list aliasing, and
 * the gate had never been able to see it. Nothing said so, because "the gate is
 * green" and "the gate could not have been otherwise" look identical.
 *
 * This axis generalises that hand-drill. It mutates the EMITTED PYTHON with a
 * set of semantics-changing operators, runs mutant and original through CPython,
 * and counts how many corpus programs change their output. A mutation that
 * changes nothing is a class of defect the corpus cannot expose - and therefore
 * one the gate cannot catch, however green it is.
 *
 * The expected side is never typed: every number is read off real CPython runs.
 * A NULL mutation is included as a control - it must be detected by exactly
 * zero programs, which is what distinguishes "the harness measures something"
 * from "the harness reports differences it invented".
 */

const here = dirname(fileURLToPath(import.meta.url));
const examplesDir = join(here, '..', 'examples');

const PYTHON = (() => {
  const cands = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of cands) if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  return null;
})();

type PyResult = { ok: boolean; out: string; err: string };

/**
 * One process for every program, WITH A PER-PROGRAM BUDGET.
 *
 * The budget is not optional here and the first version did not have one. A
 * mutant is a deliberately broken program: `i = i + 1` becoming `i = i + 2`
 * steps over the condition that ended a loop, and the sweep hangs forever on
 * its first infinite mutant. Every program gets a wall-clock budget enforced by
 * a trace hook, so a non-terminating mutant is a RESULT ("budget") rather than
 * a stalled run.
 *
 * `newline=""` keeps Windows from rewriting the results file.
 */
function batchPython(programs: string[], budgetSeconds = 0): PyResult[] {
  if (programs.length === 0) return [];
  const dir = mkdtempSync(join(tmpdir(), 'eml-gatesens-'));
  try {
    const srcFile = join(dir, 'programs.json');
    const outFile = join(dir, 'results.json');
    const esc = (p: string) => p.replace(/\\/g, '\\\\');
    writeFileSync(srcFile, JSON.stringify(programs), 'utf8');
    const guarded = budgetSeconds > 0;
    const runner = [
      'import io, json, sys, time, traceback',
      `programs = json.loads(io.open(r"${esc(srcFile)}", encoding="utf-8").read())`,
      `BUDGET = ${budgetSeconds}`,
      'class Budget(Exception): pass',
      'def make_guard(deadline):',
      '    state = [0]',
      '    def guard(frame, event, arg):',
      '        state[0] += 1',
      '        if state[0] % 2048 == 0 and time.perf_counter() > deadline:',
      '            raise Budget()',
      '        return guard',
      '    return guard',
      'results = []',
      'real = sys.stdout',
      'for src in programs:',
      '    buf = io.StringIO()',
      '    sys.stdout = buf',
      '    try:',
      `        ${guarded ? 'sys.settrace(make_guard(time.perf_counter() + BUDGET))' : 'pass'}`,
      '        exec(compile(src, "case.py", "exec"), {"__name__": "__main__"})',
      '        results.append({"ok": True, "out": buf.getvalue(), "err": ""})',
      '    except Budget:',
      '        results.append({"ok": False, "out": buf.getvalue(), "err": "budget"})',
      '    except BaseException:',
      '        results.append({"ok": False, "out": buf.getvalue(), "err": traceback.format_exc()[-200:]})',
      '    finally:',
      '        sys.settrace(None)',
      '        sys.stdout = real',
      `io.open(r"${esc(outFile)}", "w", encoding="utf-8", newline="").write(json.dumps(results))`,
    ].join('\n');
    const runFile = join(dir, 'run.py');
    writeFileSync(runFile, runner, 'utf8');
    const r = spawnSync(PYTHON!, [runFile], { encoding: 'utf8', timeout: 240_000 });
    if (r.status !== 0) throw new Error(`python batch harness failed: ${r.stderr}`);
    return JSON.parse(readFileSync(outFile, 'utf8')) as PyResult[];
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function allExamples(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...allExamples(p));
    else if (ent.name.endsWith('.eml')) out.push(p);
  }
  return out;
}

/**
 * Mutation operators over the emitted Python. `apply` returns null when the
 * operator does not apply to a program, which is how "applicable" is counted
 * rather than assumed.
 */
type Mutation = { name: string; apply: (py: string) => string | null };

const MUTATIONS: Mutation[] = [
  {
    // THE CONTROL. Semantically null. Any detection here is the harness lying.
    name: 'NULL control (append a comment)',
    apply: (py) => py + '\n# semantically nothing\n',
  },
  {
    name: 'len(x) -> 1 + len(x)',
    apply: (py) => (py.includes('len(') ? py.replace(/len\(/g, '1+len(') : null),
  },
  {
    name: 'a == b -> a != b',
    apply: (py) => (py.includes(' == ') ? py.replace(/ == /g, ' != ') : null),
  },
  {
    name: 'a < b -> a <= b',
    apply: (py) => (/ < /.test(py) ? py.replace(/ < /g, ' <= ') : null),
  },
  {
    name: 'a > b -> a >= b',
    apply: (py) => (/ > /.test(py) ? py.replace(/ > /g, ' >= ') : null),
  },
  {
    // The defect axis 15 exists for, and the one the hand-drill found invisible.
    name: 'binding a name COPIES a list instead of aliasing it',
    apply: (py) => {
      const re = /^(\s*)([A-Za-z_]\w*) = ([A-Za-z_]\w*)$/gm;
      if (!re.test(py)) return null;
      return py.replace(
        /^(\s*)([A-Za-z_]\w*) = ([A-Za-z_]\w*)$/gm,
        (_m, ind, lhs, rhs) => `${ind}${lhs} = (list(${rhs}) if isinstance(${rhs}, list) else ${rhs})`,
      );
    },
  },
  {
    name: 'str(x) -> repr(x)',
    apply: (py) => (py.includes('str(') ? py.replace(/\bstr\(/g, 'repr(') : null),
  },
  {
    name: 'literal + 1 -> + 2',
    apply: (py) => (/\+ 1\b/.test(py) ? py.replace(/\+ 1\b/g, '+ 2') : null),
  },
];

/**
 * A budget, stated out loud. The full corpus for every operator is ~2600 program
 * runs; this samples by stride so every operator sees a spread of the corpus
 * rather than its first N files, and the sample size is reported so a shrinking
 * denominator cannot pass as a stable result.
 */
const SAMPLE_TARGET = 40;

describe.skipIf(!PYTHON)('what the execution-truth gate can see', () => {
  it('mutations the corpus cannot expose are named, not assumed', () => {
    const files = allExamples(examplesDir);
    const programs: string[] = [];
    for (const f of files) {
      const t = transpileEmlToPython(readFileSync(f, 'utf8'));
      if (t.ok) programs.push(t.python);
    }
    const stride = Math.max(1, Math.floor(programs.length / SAMPLE_TARGET));
    const sample: string[] = [];
    for (let i = 0; i < programs.length; i += stride) sample.push(programs[i]!);

    const base = batchPython(sample);
    const runnable = sample.map((_, i) => base[i]!.ok);
    const runnableCount = runnable.filter(Boolean).length;

    // Anti-vacuity: a program that produces nothing agrees with every mutant of
    // itself, so a sweep over silent programs would report total blindness and
    // be right for the wrong reason.
    const silent = base.filter((b, i) => runnable[i] && b.out.trim() === '').length;

    const rows: string[] = [];
    let realDetected = 0;
    let nullDetected = -1;
    const invisible: string[] = [];

    for (const m of MUTATIONS) {
      const idx: number[] = [];
      const mutants: string[] = [];
      sample.forEach((py, i) => {
        if (!runnable[i]) return;
        const mut = m.apply(py);
        if (mut === null || mut === py) return;
        idx.push(i);
        mutants.push(mut);
      });
      const got = batchPython(mutants, 1.5);
      let changed = 0;
      got.forEach((g, k) => {
        const b = base[idx[k]!]!;
        if (g.ok !== b.ok || g.out !== b.out) changed += 1;
      });
      rows.push(
        `  ${m.name.padEnd(52)} applicable ${String(idx.length).padStart(3)}  detected ${String(changed).padStart(3)}`,
      );
      if (m.name.startsWith('NULL')) nullDetected = changed;
      else {
        if (changed > 0) realDetected += 1;
        else if (idx.length > 0) invisible.push(m.name);
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      [
        `corpus programs: ${programs.length}, sampled ${sample.length} (stride ${stride}), runnable ${runnableCount}`,
        ...rows,
        `mutations invisible to this corpus: ${invisible.length}${invisible.length ? ' -> ' + invisible.join('; ') : ''}`,
      ].join('\n'),
    );

    expect(runnableCount, 'no sampled program ran at all').toBeGreaterThan(20);
    expect(silent, `${silent} sampled programs print nothing, which agrees with every mutant`).toBe(0);
    expect(nullDetected, 'the NULL control was "detected" - the harness reports differences it invented').toBe(0);
    expect(realDetected, 'no mutation at all was detected - the harness cannot detect anything').toBeGreaterThan(2);
  });
});
