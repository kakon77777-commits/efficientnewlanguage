import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpilePythonToEml } from '@eml/transpiler-eml';
import { transpileEmlToPython } from '@eml/transpiler-python';

/**
 * REVERSE TRANSPILER, BY CONSTRUCT PAIR — differential gate against CPython.
 *
 * The sixth measured axis. Reverse Python->EML has a large test suite, and
 * every corpus program round-trips to a fixpoint, but both measure constructs
 * ONE AT A TIME: there is a test for `try`, a test for `with`, a test for
 * comprehensions. Nothing has ever asked what happens when one is nested
 * inside another.
 *
 * That gap matters for a reverse parser specifically. Its hardest job is
 * INDENTATION — deciding where a block ends — and indentation bugs are almost
 * invisible at depth 1 and become wrong programs at depth 2. A `finally` that
 * attaches to the wrong `try`, a loop body that swallows the statement after
 * it: both still parse, still emit valid Python, and still round-trip to a
 * fixpoint, because the fixpoint check only asks whether the SECOND pass
 * agrees with the first — not whether either agrees with the original.
 *
 * So this sweep runs every (outer, inner) pair through
 *
 *     python0  ->  EML  ->  python1
 *
 * and compares what the two Python programs actually PRINT under real CPython.
 * A pair that reverses into a differently-shaped program is caught even when
 * both programs are valid and both reach a fixpoint.
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

/**
 * Each construct is a template with a `%BODY%` hole and a matching indent.
 * `pre` runs before the construct so the body has something real to touch —
 * the point is a program that PRINTS something order-dependent, not one that
 * merely parses.
 */
interface Construct {
  name: string;
  pre?: string;
  open: string; // lines introducing the block, already at column 0
  indent: string; // indent the body needs
  post?: string;
}

const OUTER: Construct[] = [
  { name: 'if', open: 'if n > 0:', indent: '    ' },
  { name: 'else', open: 'if n < 0:\n    print("neg")\nelse:', indent: '    ' },
  { name: 'while', pre: 'i = 0', open: 'while i < 2:\n    i = i + 1', indent: '    ' },
  { name: 'for', open: 'for k in range(0, 2):', indent: '    ' },
  { name: 'def', open: 'def wrapper(n):', indent: '    ', post: 'wrapper(n)' },
  { name: 'try', open: 'try:', indent: '    ', post: 'except ValueError:\n    print("caught")' },
  { name: 'except', open: 'try:\n    raise ValueError("x")\nexcept ValueError:', indent: '    ' },
  { name: 'finally', open: 'try:\n    print("body")\nfinally:', indent: '    ' },
  { name: 'with', pre: 'class G:\n    def __enter__(self):\n        return self\n    def __exit__(self, a, b, c):\n        print("exit")\n        return False', open: 'with G() as g:', indent: '    ' },
  { name: 'class-method', open: 'class C:\n    def run(self, n):', indent: '        ', post: 'C().run(n)' },
];

const INNER: { name: string; body: (ind: string) => string }[] = [
  { name: 'print', body: (i) => `${i}print("inner")` },
  { name: 'assign', body: (i) => `${i}x = n + 1\n${i}print(x)` },
  { name: 'if', body: (i) => `${i}if n > 1:\n${i}    print("gt")\n${i}else:\n${i}    print("le")` },
  { name: 'for', body: (i) => `${i}for j in range(0, 2):\n${i}    print(j)` },
  { name: 'while', body: (i) => `${i}m = 0\n${i}while m < 2:\n${i}    print(m)\n${i}    m = m + 1` },
  { name: 'try', body: (i) => `${i}try:\n${i}    raise ValueError("inner")\n${i}except ValueError as e:\n${i}    print(str(e))` },
  { name: 'listcomp', body: (i) => `${i}sq = [v * v for v in range(0, 3)]\n${i}print(sq)` },
  { name: 'pass', body: (i) => `${i}pass` },
  { name: 'break', body: (i) => `${i}for j in range(0, 3):\n${i}    if j == 1:\n${i}        break\n${i}    print(j)` },
  { name: 'dict', body: (i) => `${i}d = {"a": n}\n${i}print(d["a"])` },
];

/** Build `python0` for one pair. */
function program(outer: Construct, inner: (typeof INNER)[number]): string {
  const parts: string[] = ['n = 2'];
  if (outer.pre) parts.push(outer.pre);
  parts.push(outer.open);
  parts.push(inner.body(outer.indent));
  if (outer.post) parts.push(outer.post);
  return parts.join('\n') + '\n';
}

/** Run every program in ONE CPython process; returns stdout (or an error marker). */
function cpythonAll(programs: string[], dir: string): string[] {
  const esc = (p: string) => p.replace(/\\/g, '\\\\');
  const srcFile = join(dir, 'programs.json');
  const outFile = join(dir, 'results.json');
  writeFileSync(srcFile, JSON.stringify(programs), 'utf8');
  const body = [
    'import io, json, sys',
    `programs = json.loads(io.open(r"${esc(srcFile)}", encoding="utf-8").read())`,
    'results = []',
    'real = sys.stdout',
    'for src in programs:',
    '    buf = io.StringIO()',
    '    sys.stdout = buf',
    '    try:',
    '        exec(compile(src, "case.py", "exec"), {"__name__": "__main__"})',
    '    except BaseException as e:',
    '        results.append(buf.getvalue() + "!! " + type(e).__name__ + ": " + str(e))',
    '    else:',
    '        results.append(buf.getvalue())',
    '    finally:',
    '        sys.stdout = real',
    // newline="" — on Windows this is the difference between a real result and
    // every multi-line program "diverging"; see statement-interaction.test.ts.
    `io.open(r"${esc(outFile)}", "w", encoding="utf-8", newline="").write(json.dumps(results))`,
  ].join('\n');
  const runFile = join(dir, 'run.py');
  writeFileSync(runFile, body, 'utf8');
  const r = spawnSync(PYTHON!, [runFile], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`python harness failed: ${r.stderr}`);
  return JSON.parse(readFileSync(outFile, 'utf8'));
}

describe.skipIf(!PYTHON)('reverse transpilation preserves behaviour, pair by pair', () => {
  it('every (outer, inner) nesting round-trips to a program that prints the same thing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-pairs-'));
    try {
      const pairs: { label: string; py0: string; py1: string }[] = [];
      const refused: string[] = [];

      for (const outer of OUTER) {
        for (const inner of INNER) {
          const label = `${outer.name} > ${inner.name}`;
          const py0 = program(outer, inner);
          const rev = transpilePythonToEml(py0);
          if (!rev.ok) {
            refused.push(`${label}: ${rev.error}`);
            continue;
          }
          const fwd = transpileEmlToPython(rev.eml!);
          if (!fwd.ok) {
            refused.push(`${label}: forward pass failed on the reversed EML`);
            continue;
          }
          pairs.push({ label, py0, py1: fwd.python });
        }
      }

      // A refusal is a documented limit, not a silent skip: if the reverse
      // transpiler stops supporting a nesting it supports today, this fails.
      expect(refused, `reverse transpilation refused:\n  ${refused.join('\n  ')}`).toEqual([]);
      expect(pairs.length, 'the sweep should cover every pair').toBe(OUTER.length * INNER.length);

      // Both sides of every pair run in one process: 2N programs, one spawn.
      const outputs = cpythonAll([...pairs.map((p) => p.py0), ...pairs.map((p) => p.py1)], dir);
      const n = pairs.length;
      const mismatches: string[] = [];
      pairs.forEach((p, i) => {
        const before = outputs[i]!.trim();
        const after = outputs[n + i]!.trim();
        if (before !== after) {
          mismatches.push(
            `${p.label}:\n    original  = ${JSON.stringify(before)}\n    reversed  = ${JSON.stringify(after)}\n` +
              `    round-tripped python:\n${p.py1.split('\n').map((l) => '      ' + l).join('\n')}`,
          );
        }
      });
      expect(
        mismatches,
        `${mismatches.length} of ${n} nestings change behaviour when reversed:\n  ${mismatches.join('\n  ')}`,
      ).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
