import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * OPERATOR × OPERAND-TYPE MATRIX — differential gate against real CPython.
 *
 * The two axes measured before this one both went green: every shipped syntax
 * construct had corpus coverage, and every builtin argument shape was pinned.
 * Neither can see this axis. An operator counts as "covered" the moment ONE
 * program uses it, no matter which operand types it was ever applied to — so
 * `+` looked thoroughly exercised while `tuple + tuple` had never run.
 *
 * Sweeping all 972 cells found 15 divergences in three clusters:
 *
 *   tuple as a sequence   `(1,2) + (1,2)` and `(1,2) * 3` both raised
 *   set algebra           `-` (difference) and `<`/`<=`/`>`/`>=` (subset) raised
 *   hashing / membership  a tuple could not key a dict; `{1,2} in {1,2}` raised
 *
 * Every one returned an ERROR where Python returns a value, which is the mild
 * failure mode. The reason to gate it anyway is the pattern: four of the five
 * tuple omissions were separate hand-written copies of "which types are
 * sequences", and a fifth copy will be written eventually.
 *
 * All cells run in ONE python subprocess. Spawning 972 interpreters would take
 * minutes and the gate would quietly get skipped.
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

/** One representative literal per PyVal kind the interpreter models. */
const OPERANDS: [string, string][] = [
  ['int', '7'],
  ['float', '2.5'],
  ['bool', 'True'],
  ['str', '"ab"'],
  ['list', '[1, 2]'],
  ['tuple', '(1, 2)'],
  ['dict', '{"a": 1}'],
  ['set', '{1, 2}'],
  ['none', 'None'],
];

const OPERATORS = ['+', '-', '*', '/', '%', '==', '!=', '<', '<=', '>', '>='];

interface Cell {
  label: string;
  eml: string;
  py: string;
}

/** Build every cell, keeping the TRANSPILER in the loop: the Python side is
 *  what EML actually emits, not a hand-written twin that could agree by
 *  construction. */
function buildCells(): Cell[] {
  const cells: Cell[] = [];
  const add = (label: string, expr: string) => {
    const src = `str(${expr})^0`;
    const fwd = transpileEmlToPython(src);
    if (!fwd.ok) return; // a shape EML cannot express is not a divergence
    // `print(str(X))` -> `str(X)`, so the cell can be evaluated as an expression.
    const py = fwd.python.trim().replace(/^print\(/, '').replace(/\)$/, '');
    cells.push({ label, eml: src, py });
  };
  for (const op of OPERATORS) {
    for (const [ln, lv] of OPERANDS) {
      for (const [rn, rv] of OPERANDS) add(`${ln} ${op} ${rn}`, `${lv} ${op} ${rv}`);
    }
  }
  for (const [ln, lv] of OPERANDS) {
    for (const [rn, rv] of OPERANDS) add(`${ln} in ${rn}`, `${lv} in ${rv}`);
  }
  return cells;
}

/** Evaluate every cell in ONE CPython process. Results go through a UTF-8 file
 *  rather than stdout: this console is cp950 and mangles anything outside it. */
function cpythonAll(cells: Cell[], dir: string): string[] {
  const script = join(dir, 'matrix.py');
  const outFile = join(dir, 'matrix.out');
  const body = [
    'import io, json',
    'cells = json.loads(io.open(r"' + join(dir, 'cells.json').replace(/\\/g, '\\\\') + '", encoding="utf-8").read())',
    'res = []',
    'for src in cells:',
    '    try:',
    '        res.append(str(eval(src)))',
    '    except Exception as e:',
    '        res.append("!! " + type(e).__name__ + ": " + str(e))',
    'io.open(r"' + outFile.replace(/\\/g, '\\\\') + '", "w", encoding="utf-8").write(json.dumps(res))',
  ].join('\n');
  writeFileSync(join(dir, 'cells.json'), JSON.stringify(cells.map((c) => c.py)), 'utf8');
  writeFileSync(script, body, 'utf8');
  const r = spawnSync(PYTHON!, [script], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`python failed: ${r.stderr}`);
  return JSON.parse(readFileSync(outFile, 'utf8'));
}

function emlResult(src: string): string {
  const r = interpret(src);
  // The MESSAGE is compared, not just the type. Comparing types alone let two
  // real divergences through — `"3" + 4` and `[1] + (2,)` both raised
  // TypeError on each side while saying different things, and a program that
  // prints str(e) shows the difference. An error message is observable
  // behaviour; a gate that ignores it is measuring less than it appears to.
  if (r.error) return `!! ${r.error.type}: ${r.error.message}`;
  if (!r.ok) return `~~ ${r.unsupported.join(',')}`;
  return (r.output ?? '').trim();
}

describe.skipIf(!PYTHON)('operator × operand-type matrix ≡ CPython', () => {
  it('every cell agrees, including the exception type when both raise', () => {
    const cells = buildCells();
    expect(cells.length, 'the matrix should be large enough to be worth running').toBeGreaterThan(900);

    const dir = mkdtempSync(join(tmpdir(), 'eml-matrix-'));
    try {
      const expected = cpythonAll(cells, dir);
      const mismatches: string[] = [];
      cells.forEach((cell, i) => {
        const actual = emlResult(cell.eml);
        if (actual !== expected[i]) {
          mismatches.push(`${cell.label}: cpython=${JSON.stringify(expected[i])} eml=${JSON.stringify(actual)}`);
        }
      });
      expect(mismatches, `${mismatches.length} of ${cells.length} cells diverge:\n  ${mismatches.join('\n  ')}`).toEqual(
        [],
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/**
 * The specific rules the sweep uncovered, spelled out.
 *
 * The matrix above would catch a regression in any of these, but it reports a
 * cell coordinate. These say what the rule IS, so a failure explains itself
 * instead of requiring the reader to rediscover the semantics.
 */
describe('rules the matrix pinned down', () => {
  const out = (src: string) => interpret(src).output?.trim();

  it('tuples concatenate and repeat, and stay tuples', () => {
    expect(out('str((1, 2) + (3,))^0')).toBe('(1, 2, 3)');
    expect(out('str((1, 2) * 2)^0')).toBe('(1, 2, 1, 2)');
    expect(out('str(2 * (1, 2))^0')).toBe('(1, 2, 1, 2)');
    // A repeated LIST is still a list — repetition preserves the type.
    expect(out('str([1] * 2)^0')).toBe('[1, 1]');
  });

  it('`<` on sets is SUBSET, not ordering, and it is partial', () => {
    expect(out('str({1} < {1, 2})^0')).toBe('True'); // proper subset
    expect(out('str({1, 2} < {1, 2})^0')).toBe('False'); // equal is not PROPER
    expect(out('str({1, 2} <= {1, 2})^0')).toBe('True');
    // Neither contains the other: ALL FOUR comparisons are False. Sorting by
    // this operator is meaningless, which is the whole trap.
    expect(out('str({1, 2} < {2, 3})^0')).toBe('False');
    expect(out('str({1, 2} > {2, 3})^0')).toBe('False');
    expect(out('str({1, 2} <= {2, 3})^0')).toBe('False');
    expect(out('str({1, 2} >= {2, 3})^0')).toBe('False');
  });

  it('set difference', () => {
    // The RESULT is checked by size and membership, not by printing it: a
    // multi-element set has no reproducible rendering here (CPython uses hash
    // order), so `str()` on one deliberately defers. This assertion was
    // originally written as a string comparison and had to change when that
    // guard landed — which is the guard doing its job on its own test.
    expect(out('str(len({1, 2, 3} - {2}))^0')).toBe('2');
    expect(out('str(1 in ({1, 2, 3} - {2}))^0')).toBe('True');
    expect(out('str(2 in ({1, 2, 3} - {2}))^0')).toBe('False');
    // Sets small enough to have exactly one rendering still print.
    expect(out('str({1} - {1})^0')).toBe('set()');
    expect(out('str({1, 2} - {2})^0')).toBe('{1}');
  });

  it('a tuple can key a dict, recursively — the main reason tuples exist', () => {
    expect(out('{(0, 0): "origin"} => grid\nstr(grid[(0, 0)])^0')).toBe('origin');
    expect(out('str((1, 2) in {(1, 2): 0})^0')).toBe('True');
    // Hashability is recursive: a tuple holding a list is not hashable.
    const r = interpret('str({(1, [2]): 0})^0');
    expect(r.error?.type).toBe('TypeError');
  });

  it('a set can be ASKED about but never STORED (CPython frozenset fallback)', () => {
    expect(out('str({1, 2} in {1, 2})^0')).toBe('False');
    // The rescue is specific to sets; a list still raises.
    expect(interpret('str([1] in {1})^0').error?.type).toBe('TypeError');
  });

  it('`%` skips the leftover-argument check for mapping-like right operands', () => {
    expect(out('str("ab" % [1, 2])^0')).toBe('ab'); // list is mapping-like
    expect(out('str("ab" % {"a": 1})^0')).toBe('ab'); // dict is mapping-like
    expect(interpret('str("ab" % 5)^0').error?.type).toBe('TypeError'); // int is not
  });
});
