import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * VALUE-MODEL BOUNDARIES — differential gate against real CPython.
 *
 * The fifth measured axis. The four before it are all about SHAPE: which
 * constructs appear, how many arguments a builtin takes, which operand types
 * an operator meets, how statements interact. Every one of them can be fully
 * green while the values flowing through are wrong at the edges, because they
 * all use small, well-behaved numbers.
 *
 * This axis asks a different question: at the points where a value model
 * usually breaks, does this one break the same way CPython does?
 *
 *   integer width     Python ints are unbounded; JS numbers lose precision
 *                     above 2^53 and JS bitwise ops truncate to 32 bits
 *   float repr        Python prints the SHORTEST string that round-trips
 *                     (0.1 + 0.2 -> 0.30000000000000004, 1e16 -> 1e+16)
 *   signed zero       -0.0 is a distinct float that compares equal to 0.0
 *   int/float divide  `/` always makes a float, `//` floors toward -inf
 *   float -> int      int() truncates toward zero, not toward -inf
 *   string/number     str() and repr() of a float differ from each other in
 *                     no version of Python since 3.1, but str() of an int
 *                     inside a container is repr(), which is where naive
 *                     rendering diverges
 *
 * A boundary that EML cannot express is not a divergence and is not listed; a
 * boundary EML expresses and gets wrong is a bug, and there is nowhere else in
 * the suite it would surface.
 */

const PYTHON = (() => {
  const candidates = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
})();

const CASES: { label: string; expr: string }[] = [];
/** Each case is an EXPRESSION; the harness wraps it in `str(...)^0`. */
const add = (label: string, expr: string) => CASES.push({ label, expr });

// ────────────────────────────────────────────────────────── integer width
add('2^53 exactly', '9007199254740992');
add('2^53 + 1 — the first integer a JS double cannot represent', '9007199254740993');
add('2^53 + 1 computed rather than written', '9007199254740992 + 1');
add('2^63 - 1', '9223372036854775807');
add('2^63', '9223372036854775808');
add('a 30-digit integer', '123456789012345678901234567890');
add('big integer arithmetic stays exact', '123456789012345678901234567890 + 1');
add('big * big', '99999999999999999999 * 99999999999999999999');
add('big % small', '123456789012345678901234567890 % 7');
add('negative big', '0 - 123456789012345678901234567890');
add('big equality is exact, not approximate', '9007199254740993 == 9007199254740992');
add('big comparison', '9007199254740993 > 9007199254740992');

// ─────────────────────────────────────────────────────────────── float repr
add('0.1 + 0.2', '0.1 + 0.2');
add('1/3', '1 / 3');
add('2/3', '2 / 3');
add('1e16', '10000000000000000.0');
add('1e-5', '0.00001');
add('1e-4', '0.0001');
add('very small float', '0.000000000000000001');
add('very large float', '1000000000000000000000.0');
add('float that is a whole number', '5.0');
add('float from int division', '10 / 2');
add('float sum that is not exact', '0.1 + 0.1 + 0.1');
add('subtraction leaving a tiny residue', '0.3 - 0.1');
add('float in a list renders with repr', '[0.1 + 0.2, 1 / 3]');
add('float in a tuple renders with repr', '(0.1 + 0.2, 5.0)');

// ────────────────────────────────────────────────────────────── signed zero
add('negative zero', '0 - 0.0');
add('negative zero equals zero', '(0 - 0.0) == 0.0');
add('negative zero from multiplication', '(0 - 1.0) * 0.0');
add('zero divided by a negative', '0.0 / (0 - 1.0)');

// ───────────────────────────────────────────────────── division and flooring
add('true division of ints makes a float', '7 / 2');
add('true division that divides evenly still makes a float', '8 / 2');
add('modulo of a negative takes the sign of the divisor', '(0 - 7) % 2');
add('modulo with a negative divisor', '7 % (0 - 2)');
add('float modulo', '7.5 % 2');
add('negative float modulo', '(0 - 7.5) % 2');

// ─────────────────────────────────────────────────────── conversion at edges
add('int() truncates toward zero, not toward -inf', 'int(0 - 2.7)');
add('int() of a positive float truncates', 'int(2.7)');
add('int() of a big float', 'int(1000000000000000000.0)');
add('int() of a numeric string with a sign', 'int("-42")');
add('int() of a string with underscores', 'int("1_000_000")');
add('float() of a big int keeps only 53 bits', 'float(9007199254740993)');
add('float() of a huge int', 'float(123456789012345678901234567890)');
add('int(float(big)) does not round-trip', 'int(float(9007199254740993))');
add('abs of a big negative', 'abs(0 - 123456789012345678901234567890)');
add('abs of negative zero', 'abs(0 - 0.0)');

// ───────────────────────────────────────────────────────────── bool as a number
add('True is 1 in arithmetic', 'True + 1');
add('False is 0 in arithmetic', 'False * 5');
add('bool and int compare equal', 'True == 1');
add('summing bools counts them', 'sum([True, False, True])');
add('bool in a list still renders as a bool', '[True, 1]');

// ───────────────────────────────────────────────────────── mixed comparisons
add('int equals float of the same value', '1 == 1.0');
add('big int vs float comparison is exact in Python', '9007199254740993 > 9007199254740992.0');
add('max over mixed int and float', 'max(1, 1.5, 2)');
add('min preserving the type of the winner', 'min(2, 1.0)');
add('sum of mixed int and float', 'sum([1, 2.5])');

/** Evaluate every case in ONE CPython process — see operator-matrix.test.ts
 *  for why (spawning one interpreter per case makes a gate slow enough to be
 *  quietly skipped). newline="" keeps Windows from rewriting the bytes. */
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

describe.skipIf(!PYTHON)('value-model boundaries equal CPython', () => {
  it('every boundary value renders and computes the same on both sides', () => {
    const dir = mkdtempSync(join(tmpdir(), 'eml-values-'));
    try {
      // The Python side comes from the TRANSPILER, so this can never
      // degenerate into comparing Python with itself.
      const usable: { label: string; eml: string; py: string }[] = [];
      const inexpressible: string[] = [];
      for (const c of CASES) {
        const eml = `str(${c.expr})^0`;
        const fwd = transpileEmlToPython(eml);
        if (!fwd.ok) {
          inexpressible.push(c.label);
          continue;
        }
        usable.push({ label: c.label, eml, py: fwd.python.trim().replace(/^print\(/, '').replace(/\)$/, '') });
      }
      // A shape EML cannot express is not a divergence — but it is not
      // allowed to silently shrink the gate either, so it is reported.
      expect(inexpressible, `EML could not express: ${inexpressible.join(', ')}`).toEqual([]);

      const expected = cpythonAll(usable.map((u) => u.py), dir);
      const mismatches: string[] = [];
      usable.forEach((u, i) => {
        const actual = emlResult(u.eml);
        if (actual !== expected[i]) {
          mismatches.push(`${u.label}: cpython=${JSON.stringify(expected[i])} eml=${JSON.stringify(actual)}`);
        }
      });
      expect(
        mismatches,
        `${mismatches.length} of ${usable.length} boundary values diverge:\n  ${mismatches.join('\n  ')}`,
      ).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
