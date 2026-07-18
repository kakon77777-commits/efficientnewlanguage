import { describe, it, expect } from 'vitest';
import { transpilePythonToEml, roundTripFromPython, parsePython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension, item 5: `print(x, end=...)`. Originally
 * REVERSE-ONLY by explicit user decision: EML's `^0` had no forward syntax for
 * a custom print terminator, and none was being invented at the time. That
 * decision was revisited later the same day as the `^0`-any-expression Core
 * grammar relaxation: forward EML now spells this `EXPR^0(END_EXPR)` (see
 * `tests/phase9-output-end.test.ts` for the new forward-syntax coverage) — so
 * the reverse-parser-recognition tests below remain accurate as written, but
 * the "fails loud, no forward syntax" describe block that follows now
 * describes the OLD, superseded behavior and has been updated to match the
 * new one. `Calculate_age` (the real corpus file that motivated this item)
 * now fully passes `eml compress`. See docs/agent-handoff.md "Core grammar
 * relaxation" section (print end=).
 */

describe('Phase 9 — reverse parser: print(x, end=...) recognition', () => {
  it('`print(x)` (no kwarg) still parses into a plain Output, unchanged from before', () => {
    const ast = parsePython('x = 1\nprint(x)\n');
    const stmt = ast.body[1] as { type: string; value?: unknown; end?: unknown };
    expect(stmt).toMatchObject({ type: 'Output', value: { type: 'Identifier', name: 'x' } });
    expect(stmt.end).toBeUndefined();
  });

  it('`print(x, end="")` parses into an Output with `end` set', () => {
    const ast = parsePython('x = 1\nprint(x, end="")\n');
    const stmt = ast.body[1] as { type: string; value?: unknown; end?: unknown };
    expect(stmt.type).toBe('Output');
    expect(stmt.end).toMatchObject({ type: 'StringLiteral', value: '' });
  });

  it('`print(x, end=some_var)` accepts an arbitrary expression as the end value', () => {
    const ast = parsePython('x = 1\nsep = "-"\nprint(x, end=sep)\n');
    const stmt = ast.body[2] as { type: string; end?: unknown };
    expect(stmt.type).toBe('Output');
    expect(stmt.end).toMatchObject({ type: 'Identifier', name: 'sep' });
  });

  it('`print(a, b)` (2 positional args) fails loud rather than silently mis-parsing', () => {
    expect(() => parsePython('a = 1\nb = 2\nprint(a, b)\n')).toThrow(/print/i);
  });

  it('`print(x, sep=",")` (a keyword other than `end`) fails loud with a clear message', () => {
    expect(() => parsePython('x = 1\nprint(x, sep=",")\n')).toThrow(/'end'.*keyword argument|sep/i);
  });
});

describe('Phase 9 — reverse emitter: print(x, end=...) now expresses as `EXPR^0(END_EXPR)`', () => {
  it('a plain `print(x)` still reverse-transpiles to `x^0` exactly as before', () => {
    const r = transpilePythonToEml('x = 1\nprint(x)\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('x^0');
  });

  it('`print(x, end="")` reverse-transpiles to `x^0("")`', () => {
    const r = transpilePythonToEml('x = 1\nprint(x, end="")\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('x^0("")');
  });

  it('`print(x, end="\\n")` (the semantically-redundant default) also expresses, no special-casing needed', () => {
    const r = transpilePythonToEml('x = 1\nprint(x, end="\\n")\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('x^0("\\n")');
  });

  it('the roundtrip pipeline reaches a full fixpoint, not a failure', () => {
    const rt = roundTripFromPython('x = 1\nprint(x, end="")\n');
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});

describe('Phase 9 — Calculate_age-shaped snippet: now fully passes', () => {
  it('the real corpus shape round-trips fully, no longer the file\'s remaining blocker', () => {
    const py = 'name = "Alice"\nyear = 30\nprint("%s is %d" % (name, year), end="")\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
