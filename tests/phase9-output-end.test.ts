import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Core grammar relaxation, follow-up round (same day as the `^0`-any-expression
 * relaxation): `print(x, end=...)` (Phase 9 item 5) was a deliberate PERMANENT
 * reverse-only limitation — forward EML had no syntax for a custom print
 * terminator. Revisited after re-running the 5 real B-6 corpus files showed
 * `Calculate_age` as the ONLY still-blocked file, and its sole remaining gap
 * was exactly this. New forward syntax: `EXPR^0(END_EXPR)` — chosen (via
 * AskUserQuestion) over a comma-separated form for being visually unambiguous
 * and matching the project's existing "parens = extra info slot right after a
 * sigil" precedent (`^+(...)`).
 *
 * Confirmed zero collision risk before implementing: `^0` previously required
 * the very next token to be `NEWLINE`/`DEDENT`/`EOF`, so `LPAREN` there was
 * already a guaranteed parse error in every prior program.
 *
 * This does NOT require general keyword-argument-call syntax anywhere else in
 * the language — `parseArgs()` (ordinary function calls) stays positional-only,
 * untouched. The interpreter's `write`/`finalize` also needed a small refactor:
 * `write()` has exactly one call site in the whole file (the `Output` case), so
 * moving the terminator decision into `write(text, end)` itself and simplifying
 * `finalize()` to a plain `out.join('')` was a ~4-line change, not a structural
 * one — byte-identical output for every existing program (which only ever used
 * the default `'\n'`).
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

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

describe('Phase 9 — forward parser: `^0(END_EXPR)` custom terminator', () => {
  it('parses `x^0("")` (fast IDENT+CARET path) with `end` set', () => {
    const ast = parse('x^+1\nx^0("")\n');
    const stmt = ast.body[1] as { type: string; value?: unknown; end?: unknown };
    expect(stmt).toMatchObject({ type: 'Output', value: { type: 'Identifier', name: 'x' }, end: { type: 'StringLiteral', value: '' } });
  });

  it('parses `(a + b)^0("")` (general EXPR^0 fallback) with `end` set', () => {
    const ast = parse('a^+1\nb^+2\n(a + b)^0("")\n');
    const stmt = ast.body[2] as { type: string; end?: unknown };
    expect(stmt.type).toBe('Output');
    expect(stmt.end).toMatchObject({ type: 'StringLiteral', value: '' });
  });

  it('accepts an arbitrary expression (an identifier) as the terminator', () => {
    const ast = parse('x^+1\nsep^+"-"\nx^0(sep)\n');
    const stmt = ast.body[2] as { type: string; end?: unknown };
    expect(stmt.end).toMatchObject({ type: 'Identifier', name: 'sep' });
  });

  it('a plain `x^0` (no parens) still parses with `end: undefined` (regression)', () => {
    const ast = parse('x^+1\nx^0\n');
    const stmt = ast.body[1] as { end?: unknown };
    expect(stmt.end).toBeUndefined();
  });
});

describe('Phase 9 — forward emit: `^0(END_EXPR)` round-trips as Python-identical syntax', () => {
  it('emits `print(x, end="")` from `x^0("")`', () => {
    const r = transpileEmlToPython('x^+1\nx^0("")\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('print(x, end="")');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: custom print terminators', () => {
  it('two prints in sequence, one suppressing the newline, land on the same output line', () => {
    const src = 'a^+"Alice is "\na^0("")\nb^+"here"\nb^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('Alice is here');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('Alice is here');
  });

  it('a plain `x^0` (default terminator) still behaves byte-identically to before', () => {
    const src = 'x^+42\nx^0\n';
    expect(interpret(src, { now: FIXED_CLOCK }).output).toBe('42\n');
  });

  it('the exact Calculate_age line (a `%`-format value AND a custom terminator) executes correctly', () => {
    const src = 'name^+"Alice"\nyear^+30\n("%s is %d years or " % (name, year))^0("")\n"done"^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('Alice is 30 years or done');
  });
});

describe('Phase 9 — reverse Python->EML: real corpus line round-trips fully', () => {
  it('the EXACT Calculate_age print line round-trips end-to-end', () => {
    const py = 'name = "Alice"\nyear = 30\nprint("%s is %d years or " % (name, year), end="")\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('the full two-print Calculate_age tail (custom terminator then a default one) round-trips', () => {
    const py =
      'name = "Alice"\n' +
      'year = 30\n' +
      'month = 360\n' +
      'day = 10950\n' +
      'print("%s is %d years or " % (name, year), end="")\n' +
      'print("%d months or %d days" % (month, day))\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('rejects a custom print terminator with E_CPP_UNSUPPORTED', () => {
    const r = transpileEmlToCpp('x^+1\nx^0("")\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });

  it('self-recursion hidden inside a custom terminator is still detected (expressionCallsName must not miss it)', () => {
    const r = transpileEmlToCpp('def fact(n):\n    n^0(fact(n))\n    return n\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
    // Must fail on the RECURSION check (which runs before body emission), not silently pass it
    // and fail later on the (also-true) "custom print terminator is not supported" rejection —
    // that would mean statementCallsName's Output case failed to check `end`.
    expect(r.diagnostics[0]?.message).toContain('Recursive function');
  });
});
