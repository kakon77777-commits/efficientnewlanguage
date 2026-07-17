import { describe, it, expect } from 'vitest';
import { transpilePythonToEml, roundTripFromPython, parsePython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension, item 5: `print(x, end=...)` — REVERSE-ONLY, by
 * explicit user decision (asked directly, not decided unilaterally): EML's
 * `^0` has no forward syntax for a custom print terminator, and none is being
 * invented. So this recognizes `print(x, end=...)` when parsing real Python,
 * but `eml-emitter.ts` always fails loud when trying to express it — the same
 * treatment already given to `await`/`async`/Matrix-in-C++. This means
 * `Calculate_age` (the real corpus file that motivated this item) still does
 * NOT fully pass `eml compress` — the point is a precise, honest diagnostic of
 * where EML's expressible subset ends, not a new round-trip success. See
 * docs/agent-handoff.md "Phase 9" section, item 5.
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

describe('Phase 9 — reverse emitter: print(x, end=...) fails loud (EML has no forward syntax for it)', () => {
  it('a plain `print(x)` still reverse-transpiles to `x^0` exactly as before', () => {
    const r = transpilePythonToEml('x = 1\nprint(x)\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('x^0');
  });

  it('`print(x, end="")` fails with the specific new EmlEmitError message, not a generic one', () => {
    const r = transpilePythonToEml('x = 1\nprint(x, end="")\n');
    expect(r.ok).toBe(false);
    expect(r.error).toContain("EML cannot express print's 'end' keyword argument");
  });

  it('`print(x, end="\\n")` (the semantically-redundant default) still fails — no literal-value special-casing', () => {
    const r = transpilePythonToEml('x = 1\nprint(x, end="\\n")\n');
    expect(r.ok).toBe(false);
    expect(r.error).toContain("EML cannot express print's 'end' keyword argument");
  });

  it('the roundtrip pipeline reports the same failure, not a different one further down the pipe', () => {
    const rt = roundTripFromPython('x = 1\nprint(x, end="")\n');
    expect(rt.ok).toBe(false);
    expect(rt.message).toContain("EML cannot express print's 'end' keyword argument");
  });
});

describe('Phase 9 — Calculate_age-shaped snippet: the failure point moves, but still fails (expected)', () => {
  it('the real corpus shape now fails at emit-time with a clear message, not the old opaque parse assertion', () => {
    const py = 'name = "Alice"\nyear = 30\nprint("%s is %d" % (name, year), end="")\n';
    const r = transpilePythonToEml(py);
    expect(r.ok).toBe(false);
    // Specifically NOT the old confusing parser assertion this used to hit.
    expect(r.error).not.toContain('Expected RPAREN but found ASSIGN');
    expect(r.error).toContain("EML cannot express print's 'end' keyword argument");
  });
});
