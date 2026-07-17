import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension, item 2: numeric modulo `%` (real B-6 corpus
 * gap: `Leap_Year_Checker`'s `year % 4 == 0` etc). Unlike item 1 (`and`/`or`),
 * `%` reuses the EXISTING `Binary` node — every semantic walker already
 * handles it generically, so this phase concentrates entirely on getting the
 * two backends that re-implement Python arithmetic from scratch
 * (`@eml/interp`, the C++ prototype) correct: Python's `%` is FLOOR-mod (sign
 * follows the divisor), unlike JS's/C++'s native truncating `%` (sign follows
 * the dividend) — see `docs/EML-LANG-2026-v1.0.md` §5.7 and
 * `docs/reverse-transpiler-feasibility.md`'s methodology this reuses.
 * String-formatting `%` (`"%s" % (a, b)`) was implemented later, in Phase 9
 * item 3a (tests/phase9-tuple-format.test.ts) — at the time this file was
 * written it still deferred as Unsupported.
 */

function resolvePython(): string | null {
  const cands = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
  for (const c of cands) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return c;
  }
  return null;
}
const PYTHON = resolvePython();
function pythonStdout(py: string): string {
  const r = spawnSync(PYTHON!, ['-c', py], { encoding: 'utf8' });
  if (r.error) throw r.error;
  expect(r.status, `python exited non-zero:\n${r.stderr}`).toBe(0);
  return r.stdout.replace(/\r\n/g, '\n').trimEnd();
}

describe('Phase 9 — forward parser/emitter: %', () => {
  it('parses `%` as a Binary node', () => {
    const ast = parse('x % y\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'Binary', op: '%' });
  });

  it('`%` groups at the same precedence tier as `*`/`/` (tighter than `+`)', () => {
    const r = transpileEmlToPython('a^+10\nb^+3\na + b % 2 => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = a + b % 2');
  });

  it('`%` is non-associative: an explicit right-side grouping keeps its parens', () => {
    const grouped = transpileEmlToPython('a^+10\nb^+3\nc^+2\na % (b % c) => r\nr^0');
    expect(grouped.python).toContain('r = a % (b % c)');
    const ungrouped = transpileEmlToPython('a^+10\nb^+3\nc^+2\n(a % b) % c => r\nr^0');
    expect(ungrouped.python).toContain('r = a % b % c');
  });

  it('`x %= 5` (target-first augmented) round-trips through the existing generic machinery', () => {
    const r = transpileEmlToPython('x^+10\nx %= 3\nx^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('x %= 3');
  });

  it('`x^%5` (sigil overlay form) emits the real `%=` operator, matching every other non-`+` sigil', () => {
    const r = transpilePythonToEml('x = 10\nx %= 3\nprint(x)\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('x^%3');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: floor-mod, not truncating mod', () => {
  const cases: Array<[string, string, string]> = [
    ['0 - 7 => a\n3 => b\na % b => r\nr^0', '2', '-7 % 3 == 2 (JS/C++ native % would give -1)'],
    ['7 => a\n0 - 3 => b\na % b => r\nr^0', '-2', '7 % -3 == -2'],
    ['0 - 7 => a\n0 - 3 => b\na % b => r\nr^0', '-1', '-7 % -3 == -1'],
    ['0 - 7.5 => a\n3 => b\na % b => r\nr^0', '1.5', '-7.5 % 3 == 1.5 (float floor-mod)'],
  ];
  for (const [src, expected, label] of cases) {
    it(label, () => {
      const r = transpileEmlToPython(src);
      expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
      expect(pythonStdout(r.python)).toBe(expected);
      // The interpreter must match too, not just the forward-emitted Python.
      const interp = interpret(src);
      expect(interp.output.trimEnd()).toBe(expected);
    });
  }
});

describe('Phase 9 — interpreter: ZeroDivisionError + string-% is REAL formatting (Phase 9 item 3a)', () => {
  it('modulo by zero raises ZeroDivisionError (verified message text against real Python)', () => {
    const r = interpret('a^+5\nb^+0\na % b => r\nr^0');
    expect(r.error?.type).toBe('ZeroDivisionError');
    expect(r.error?.message).toBe('division by zero');
  });

  // Superseded by Phase 9 item 3a: `"x" % y` used to defer as Unsupported
  // (string-formatting `%` wasn't modeled yet); it's now real — see
  // tests/phase9-tuple-format.test.ts for the full %-formatting suite. This
  // specific case ("hi" has no format directive at all) now raises the exact
  // real-Python TypeError, verified directly, not the old placeholder defer.
  it('a format string with no directives raises the real Python TypeError (arg not consumed)', () => {
    const r = interpret('a^+"hi"\nb^+5\na % b => r\nr^0');
    expect(r.error?.type).toBe('TypeError');
    expect(r.error?.message).toBe('not all arguments converted during string formatting');
    expect(r.ok).toBe(false);
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('emits real `%` for integer operands', () => {
    const r = transpileEmlToCpp('a^+10\nb^+3\na % b => r\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.cpp).toContain('a % b');
  });

  it('rejects a non-integer literal operand (C++ `%` is integer-only, unlike Python)', () => {
    const r = transpileEmlToCpp('1.5 % 2 => r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });
});

describe('Phase 9 — reverse Python->EML: % round-trip', () => {
  it('a Leap_Year_Checker-shaped modulo condition round-trips', () => {
    const py = 'year = 2000\nr = year % 4 == 0\nprint(r)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a mixed %/and/or combo (mirrors the real Leap_Year_Checker corpus shape) round-trips', () => {
    const py =
      'year = 2000\n' +
      'if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:\n' +
      '    ok = 1\n' +
      'else:\n' +
      '    ok = 0\n' +
      'print(ok)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
