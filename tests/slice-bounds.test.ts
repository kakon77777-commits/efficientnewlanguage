import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * SLICE BOUNDS — differential gate against real CPython.
 *
 * The seventh measured axis, and the first aimed at a construct whose whole
 * difficulty is what it does with *wrong* inputs.
 *
 * Indexing and slicing look like the same operation and behave nothing alike:
 *
 *     xs[9]     -> IndexError
 *     xs[9:]    -> []            no error, ever
 *     xs[-9:]   -> the whole list
 *     xs[3:1]   -> []            reversed bounds are empty, not an error
 *
 * Python clamps slice bounds into range instead of rejecting them, negatives
 * wrap once and then clamp, and a start past the stop yields empty. Every one
 * of those is a rule an implementation can get individually right and still
 * combine wrongly — and none of them raises, so a mistake here is silent
 * truncation rather than a crash.
 *
 * Earlier axes cannot see this. `tests/operator-matrix.test.ts` measures
 * operators, and a slice is not one; `tests/value-boundaries.test.ts` measures
 * what a VALUE renders as, not what a bound does to a container. The corpus
 * uses slices (`word-wrap`, `manual-csv-parser`, and others) but only with the
 * in-range bounds a working program naturally has.
 *
 * The sweep is 3 container types x 10 starts x 10 stops = 300 cells, with
 * omitted bounds included on both sides because `xs[:n]` and `xs[n:]` are the
 * forms real code actually writes.
 *
 * EML-P has NO step: `xs[::2]` is `E_PARSE: Unexpected token COLON`. That is a
 * language limit, asserted at the bottom of this file rather than skipped.
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

/** Five elements each, so index 5 is exactly one past the end. */
const CONTAINERS: [string, string][] = [
  ['str', '"abcde"'],
  ['list', '[1, 2, 3, 4, 5]'],
  ['tuple', '(1, 2, 3, 4, 5)'],
];

/**
 * Bounds chosen to hit every region of Python's clamping rule:
 * far negative (wraps past the start), negative in range, zero, in range,
 * exactly the length, past the end, and omitted.
 */
const BOUNDS = ['', '-9', '-5', '-3', '-1', '0', '1', '3', '5', '9'];

interface Cell {
  label: string;
  eml: string;
  py: string;
}

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  for (const [cname, cval] of CONTAINERS) {
    for (const start of BOUNDS) {
      for (const stop of BOUNDS) {
        const expr = `${cval}[${start}:${stop}]`;
        const eml = `str(${expr})^0`;
        const fwd = transpileEmlToPython(eml);
        if (!fwd.ok) continue; // reported separately below
        // `print(str(X))` -> `str(X)`, so the cell evaluates as an expression.
        const py = fwd.python.trim().replace(/^print\(/, '').replace(/\)$/, '');
        cells.push({ label: `${cname}[${start}:${stop}]`, eml, py });
      }
    }
  }
  return cells;
}

/** Every cell in ONE CPython process — see operator-matrix.test.ts for why.
 *  newline="" keeps Windows from rewriting the bytes. */
function cpythonAll(exprs: string[], dir: string): string[] {
  const esc = (p: string) => p.replace(/\\/g, '\\\\');
  const srcFile = join(dir, 'exprs.json');
  const outFile = join(dir, 'results.json');
  writeFileSync(srcFile, JSON.stringify(exprs), 'utf8');
  const body = [
    'import io, json',
    `exprs = json.loads(io.open(r"${esc(srcFile)}", encoding="utf-8").read())`,
    'res = []',
    'for src in exprs:',
    '    try:',
    '        res.append(str(eval(src)))',
    '    except Exception as e:',
    '        res.append("!! " + type(e).__name__ + ": " + str(e))',
    `io.open(r"${esc(outFile)}", "w", encoding="utf-8", newline="").write(json.dumps(res))`,
  ].join('\n');
  const runFile = join(dir, 'run.py');
  writeFileSync(runFile, body, 'utf8');
  const r = spawnSync(PYTHON!, [runFile], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`python harness failed: ${r.stderr}`);
  return JSON.parse(readFileSync(outFile, 'utf8'));
}

function emlResult(src: string): string {
  const r = interpret(src);
  if (r.error) return `!! ${r.error.type}: ${r.error.message}`;
  if (!r.ok) return `~~ DEFER ${(r.unsupported ?? []).join(',')}`;
  return (r.output ?? '').trim();
}

describe.skipIf(!PYTHON)('slice bounds equal CPython', () => {
  it('every (container, start, stop) combination agrees', () => {
    const cells = buildCells();
    expect(cells.length, 'the sweep should cover every combination').toBe(
      CONTAINERS.length * BOUNDS.length * BOUNDS.length,
    );

    const dir = mkdtempSync(join(tmpdir(), 'eml-slice-'));
    try {
      const expected = cpythonAll(cells.map((c) => c.py), dir);
      const mismatches: string[] = [];
      cells.forEach((cell, i) => {
        const actual = emlResult(cell.eml);
        if (actual !== expected[i]) {
          mismatches.push(`${cell.label}: cpython=${JSON.stringify(expected[i])} eml=${JSON.stringify(actual)}`);
        }
      });
      expect(
        mismatches,
        `${mismatches.length} of ${cells.length} slice bounds diverge:\n  ${mismatches.join('\n  ')}`,
      ).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/**
 * The rules the sweep pins down, stated so a failure explains itself instead
 * of reporting a coordinate.
 */
describe('rules the slice sweep pinned down', () => {
  const out = (src: string) => interpret(src).output?.trim();

  it('a slice NEVER raises, however wrong the bounds are', () => {
    expect(out('str([1, 2, 3][9:99])^0')).toBe('[]');
    expect(out('str([1, 2, 3][-99:-50])^0')).toBe('[]');
    expect(out('str("abc"[5:])^0')).toBe('');
    // Compare with indexing, which does raise — same brackets, opposite rule.
    expect(interpret('str([1, 2, 3][9])^0').error?.type).toBe('IndexError');
  });

  it('out-of-range bounds clamp rather than extend', () => {
    expect(out('str([1, 2, 3, 4, 5][0:99])^0')).toBe('[1, 2, 3, 4, 5]');
    expect(out('str([1, 2, 3, 4, 5][-99:])^0')).toBe('[1, 2, 3, 4, 5]');
    expect(out('str("abcde"[-99:99])^0')).toBe('abcde');
  });

  it('negative bounds wrap once, then clamp', () => {
    expect(out('str([1, 2, 3, 4, 5][-2:])^0')).toBe('[4, 5]');
    expect(out('str([1, 2, 3, 4, 5][:-2])^0')).toBe('[1, 2, 3]');
    // -3 is index 2 and -1 is index 4 EXCLUSIVE, so this is [3, 4] and not
    // [2, 3, 4]. Written wrong the first time and caught by running it — a
    // hand-typed expectation is exactly the thing a differential replaces.
    expect(out('str([1, 2, 3, 4, 5][-3:-1])^0')).toBe('[3, 4]');
    // -9 on a 5-element list wraps to -4, which clamps to 0 — not to 1.
    expect(out('str([1, 2, 3, 4, 5][-9:2])^0')).toBe('[1, 2]');
  });

  it('start past stop is empty, not reversed and not an error', () => {
    expect(out('str([1, 2, 3, 4, 5][3:1])^0')).toBe('[]');
    expect(out('str([1, 2, 3, 4, 5][-1:-3])^0')).toBe('[]');
    expect(out('str("abcde"[4:0])^0')).toBe('');
  });

  it('a slice preserves the container type; an index does not', () => {
    expect(out('str([1, 2, 3][0:1])^0')).toBe('[1]'); // list -> list
    expect(out('str((1, 2, 3)[0:1])^0')).toBe('(1,)'); // tuple -> 1-tuple, with the comma
    expect(out('str("abc"[0:1])^0')).toBe('a'); // str -> str
    expect(out('str([1, 2, 3][0])^0')).toBe('1'); // index -> the element
  });

  it('an omitted bound is not the same as zero at the far end', () => {
    expect(out('str([1, 2, 3][:])^0')).toBe('[1, 2, 3]');
    expect(out('str([1, 2, 3][0:])^0')).toBe('[1, 2, 3]');
    // `[:0]` is empty while `[:]` is everything — the asymmetry that makes
    // "just default it to 0" wrong for the stop bound.
    expect(out('str([1, 2, 3][:0])^0')).toBe('[]');
  });
});

/**
 * KNOWN PROFILE BOUNDARY, asserted rather than skipped.
 *
 * EML-P slices take two parts. A step (`xs[::2]`, `xs[::-1]`) does not parse,
 * so the idiomatic Python reverse is unavailable and a program has to build
 * the reversed sequence itself — `examples/reverse-string-recursive` does
 * exactly that.
 *
 * Pinned so that the day a step is added, this test fails and says where.
 */
describe('EML-P slice boundary: no step', () => {
  it('a three-part slice does not parse', () => {
    const r = transpileEmlToPython('str([1, 2, 3][::2])^0');
    expect(r.ok).toBe(false);
    expect(JSON.stringify(r.diagnostics)).toContain('E_PARSE');
  });

  it('assigning THROUGH a slice is refused rather than half-implemented', () => {
    const r = interpret('[1, 2, 3] => xs\n[9] => xs[0:1]\nstr(xs)^0');
    expect(r.ok).toBe(false);
  });
});
