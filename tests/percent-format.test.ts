import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// Reached by path rather than through the package index: these are interpreter
// internals, and adding a public subpath export just to test them would widen
// @eml/interp's API for no caller's benefit.
import { percentFormat, INT, FLOAT, STR } from '../packages/interp/src/values';

/**
 * `%`-FORMATTING CONFORMANCE. `"fmt" % (args)` must produce byte-identical text
 * in the interpreter and in the transpiled Python, across the whole spec
 * grammar — `%[flags][width][.precision]type` — not just the bare conversions.
 *
 * It used to support only `%s`, `%d`, `%f` and `%%`, raising
 * `ValueError: unsupported format character` for everything else. So
 * `"%.2f" % (total,)` CRASHED in the browser interpreter while running fine as
 * its own Python projection. `%.2f` is how you format money and `%5d` is how
 * you line up a column: this was not a corner case, it was most real
 * formatting.
 *
 * Rather than assert hand-written expectations (which would only re-encode
 * whatever I believed CPython does), this asks CPython for every answer and
 * diffs. Three behaviours were wrong in the first implementation and the diff
 * is the only reason they were found:
 *   - `.N` on an INTEGER is a minimum digit count, not a truncation
 *     (`"%.3d" % 0` is '000'), and it does NOT cancel the '0' flag.
 *   - '#' on a float keeps the decimal point (`"%#.0f" % 0` is '0.').
 *   - ties round HALF TO EVEN on the exact binary value: `"%.0f" % 2.5` is '2'.
 *     JS `toFixed` rounds ties away from zero ('3'), and `Intl` with
 *     roundingMode 'halfEven' rounds the SHORTEST DECIMAL rather than the exact
 *     value, so `"%.2f" % 2.675` gives '2.68' there against CPython's '2.67'.
 *     Neither built-in is usable; values.ts does the arithmetic in BigInt off
 *     the IEEE-754 bits.
 */

function resolvePython(): string | null {
  const cands = process.env.EML_PYTHON
    ? [process.env.EML_PYTHON]
    : process.platform === 'win32'
      ? ['python', 'py', 'python3']
      : ['python3', 'python'];
  for (const c of cands) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return c;
  }
  return null;
}
const PYTHON = resolvePython();

const SEP = String.fromCharCode(1); // record separator
const REJECTED = String.fromCharCode(0); // CPython refused this spec/value pair

const CONVERSIONS = ['s', 'r', 'd', 'i', 'u', 'f', 'F', 'e', 'E', 'g', 'G', 'x', 'X', 'o', 'c'];
const FLAGSETS = ['', '-', '0', '+', ' ', '#', '+0', '-0', '# ', '#+'];
const WIDTHS = ['', '1', '7', '12'];
const PRECISIONS = ['', '.0', '.1', '.2', '.5'];

/**
 * Values chosen to be hostile rather than representative: exact ties at several
 * precisions (0.5 / 1.5 / 2.5 / 1.25 / 0.125), decimals whose shortest
 * representation disagrees with their exact double (2.675, 1.005, 0.615), a
 * carry boundary (9.995), both ends of the float range, and -0.0.
 */
const VALUES: Array<{ eml: () => ReturnType<typeof INT>; py: string }> = [
  { eml: () => INT(0n), py: '0' },
  { eml: () => INT(7n), py: '7' },
  { eml: () => INT(-7n), py: '-7' },
  { eml: () => INT(255n), py: '255' },
  { eml: () => INT(65535n), py: '65535' },
  { eml: () => FLOAT(0.5), py: '0.5' },
  { eml: () => FLOAT(1.5), py: '1.5' },
  { eml: () => FLOAT(2.5), py: '2.5' },
  { eml: () => FLOAT(-2.5), py: '-2.5' },
  { eml: () => FLOAT(0.125), py: '0.125' },
  { eml: () => FLOAT(1.25), py: '1.25' },
  { eml: () => FLOAT(2.675), py: '2.675' },
  { eml: () => FLOAT(1.005), py: '1.005' },
  { eml: () => FLOAT(0.615), py: '0.615' },
  { eml: () => FLOAT(9.995), py: '9.995' },
  { eml: () => FLOAT(3.14159), py: '3.14159' },
  { eml: () => FLOAT(0.0001), py: '0.0001' },
  { eml: () => FLOAT(1e20), py: '1e20' },
  { eml: () => FLOAT(1e-20), py: '1e-20' },
  { eml: () => FLOAT(-0.0), py: '-0.0' },
  { eml: () => FLOAT(123456789), py: '123456789.0' },
  { eml: () => STR('z') as never, py: "'z'" },
];

const CASES: Array<{ spec: string; vi: number }> = [];
for (const conv of CONVERSIONS) {
  for (const flags of FLAGSETS) {
    for (const width of WIDTHS) {
      for (const prec of PRECISIONS) {
        for (let vi = 0; vi < VALUES.length; vi++) {
          CASES.push({ spec: '%' + flags + width + prec + conv, vi });
        }
      }
    }
  }
}

/** One CPython run for the whole matrix. */
function pythonAnswers(): string[] {
  const scriptPath = join(tmpdir(), `eml-percent-format-${process.pid}.py`);
  const outPath = join(tmpdir(), `eml-percent-format-${process.pid}.txt`);
  const script = [
    'import io',
    'vals = [' + VALUES.map((v) => v.py).join(', ') + ']',
    'cases = ' + JSON.stringify(CASES.map((c) => [c.spec, c.vi])),
    'out = []',
    'for spec, vi in cases:',
    '    try:',
    '        out.append(spec % (vals[vi],))',
    '    except Exception:',
    '        out.append(chr(0))',
    // NOT sys.stdout: this host's console encoding is cp950, and `%c` of 255
    // produces U+00FF, which cp950 cannot encode — the run dies with
    // UnicodeEncodeError before emitting anything. Writing UTF-8 to a file
    // sidesteps the console codec entirely. (Same trap as the Sigma round.)
    'io.open(' + JSON.stringify(outPath) + ", 'w', encoding='utf-8', newline='').write(chr(1).join(out))",
  ].join('\n');

  writeFileSync(scriptPath, script, 'utf8');
  try {
    const r = spawnSync(PYTHON!, [scriptPath], { encoding: 'utf8' });
    if (r.error) throw r.error;
    expect(r.status, r.stderr).toBe(0);
    return readFileSync(outPath, 'utf8').split(SEP);
  } finally {
    rmSync(scriptPath, { force: true });
    rmSync(outPath, { force: true });
  }
}

describe.skipIf(!PYTHON)('% formatting matches CPython exactly', () => {
  it(`agrees on all ${CASES.length} spec/value combinations`, () => {
    const want = pythonAnswers();
    expect(want.length).toBe(CASES.length);

    const mismatches: string[] = [];
    let compared = 0;
    for (let i = 0; i < CASES.length; i++) {
      const { spec, vi } = CASES[i]!;
      const expected = want[i]!;
      if (expected === REJECTED) continue; // CPython refuses it; not a formatting question
      compared++;
      let got: string;
      try {
        got = percentFormat(spec, [VALUES[vi]!.eml()]);
      } catch (e) {
        got = `<threw ${(e as Error).message}>`;
      }
      if (got !== expected) {
        mismatches.push(`${spec} % (${VALUES[vi]!.py},) -> ${JSON.stringify(got)}, want ${JSON.stringify(expected)}`);
      }
    }
    // Guard against the matrix silently collapsing to nothing.
    expect(compared).toBeGreaterThan(5000);
    expect(mismatches.slice(0, 20).join('\n')).toBe('');
  });
});

describe('% formatting regression pins', () => {
  /** Literal values read off CPython 3.14.5, so these hold with no Python present. */
  const PINS: Array<[string, () => ReturnType<typeof INT>, string, string]> = [
    ['%.2f', () => FLOAT(3.14159), '3.14', 'the case that used to raise ValueError'],
    ['%5d', () => INT(7n), '    7', 'width alone used to raise'],
    ['%-8s|', () => STR('x') as never, 'x       |', 'left-justify'],
    ['%05.2f', () => FLOAT(3.14159), '03.14', 'zero-fill sits after the sign'],
    ['%x', () => INT(255n), 'ff', 'alternate radix'],
    ['%.3d', () => INT(0n), '000', 'integer precision is a MINIMUM, not a truncation'],
    ['%#.0f', () => FLOAT(0), '0.', "'#' keeps the decimal point"],
    ['%.0f', () => FLOAT(2.5), '2', 'ties round to EVEN (toFixed would say 3)'],
    ['%.0f', () => FLOAT(3.5), '4', 'and 3.5 rounds up, to the even 4'],
    ['%.2f', () => FLOAT(2.675), '2.67', 'the exact double is 2.67499..., not the 2.675 you typed'],
    ['%+.3e', () => FLOAT(1234.5), '+1.234e+03', 'two-digit exponent, tie to even'],
  ];

  for (const [spec, mk, expected, why] of PINS) {
    it(`${spec} -> ${JSON.stringify(expected)} (${why})`, () => {
      expect(percentFormat(spec, [mk()])).toBe(expected);
    });
  }
});
