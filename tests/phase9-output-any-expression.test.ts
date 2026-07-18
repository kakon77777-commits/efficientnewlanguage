import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Core grammar relaxation (not a Phase 9 language-extension item — this touches
 * `OutputStatement`'s EBNF directly, `docs/EML-LANG-2026-v1.0.md` §5.3): `^0`
 * used to require a bare identifier (`OutputStatement ::= Identifier "^0"`).
 * After Phase 9's language-extension track fully closed (slice syntax + list
 * comprehensions), re-running the 5 real B-6 corpus files showed all 4
 * still-blocked files sharing this ONE root cause in different shapes — a call
 * (`.format(...)`), a bare string literal, and a `%`-format binary expression.
 *
 * The restriction turned out to be enforced in exactly one place per direction:
 * the forward parser's `OutputStatement` construction site (gated on a narrow
 * `IDENT` + `CARET` lookahead) and `eml-emitter.ts`'s `Output` case (an explicit
 * type check). The AST, the forward Python emitter, the interpreter, and all 7
 * semantic walkers already treated `Output.value` as a fully general
 * `Expression` — zero changes needed there. The widening is safe at the parser
 * level because of an existing carve-out in `parsePower()`: `CARET` immediately
 * followed by the literal digit `0` is NEVER consumed as a power operation, at
 * any depth of the precedence chain — so `parseExpression()` always leaves a
 * trailing `^0` dangling, regardless of the expression's shape, for the new
 * check to detect.
 *
 * `print(x, end=...)` (Phase 9 item 5) is a SEPARATE, still-fully-intact,
 * deliberate permanent limitation — untouched by this round. `eml-emitter.ts`
 * checks `stmt.end !== undefined` before the (now-removed) value-type check, so
 * a print with both a non-identifier value AND `end=` (like `Calculate_age`'s
 * real corpus line) still fails, on the same `end=`-specific message as before.
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

describe('Phase 9 — forward parser: `^0` accepts any expression', () => {
  it('parses `"hello"^0` (a bare string literal)', () => {
    const ast = parse('"hello"^0\n');
    expect(ast.body[0]).toMatchObject({ type: 'Output', value: { type: 'StringLiteral', value: 'hello' } });
  });

  it('parses `(a + b)^0` (a parenthesized binary expression)', () => {
    const ast = parse('a^+1\nb^+2\n(a + b)^0\n');
    expect(ast.body[2]).toMatchObject({
      type: 'Output',
      value: { type: 'Binary', op: '+', left: { name: 'a' }, right: { name: 'b' } },
    });
  });

  it('parses `f(x)^0` (a call expression)', () => {
    const ast = parse('@cold\ndef f(x):\n    return x\n\nf(1)^0\n');
    const stmt = ast.body[1] as { type: string; value?: { type: string } };
    expect(stmt).toMatchObject({ type: 'Output', value: { type: 'Call' } });
  });

  it('a plain `x^0` still parses identically to before (regression, via the untouched fast path)', () => {
    const ast = parse('x^+1\nx^0\n');
    expect(ast.body[1]).toMatchObject({ type: 'Output', value: { type: 'Identifier', name: 'x' } });
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: `^0` on non-identifier values', () => {
  it('prints a bare string literal directly', () => {
    const src = '"Deleted Files"^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('Deleted Files');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('Deleted Files');
  });

  it('prints a call expression directly (`.format(...)`-shaped)', () => {
    const src = 's^+"Binary: {}"\nn^+"1010"\n(s.format(n))^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('Binary: 1010');
  });

  it('prints a `%`-format binary expression directly', () => {
    const src = 'name^+"Alice"\nage^+30\n("%s is %d" % (name, age))^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('Alice is 30');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('Alice is 30');
  });
});

describe('Phase 9 — reverse Python->EML: real corpus print lines round-trip', () => {
  it('Duplicate_files_remover-shaped: `print(\'Deleted Files\')` (bare string literal)', () => {
    const py = "print('Deleted Files')\n";
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it("Decimal_to_binary_convertor-shaped: `print(\"Binary: {}\".format(bin(dec)[2:]))`", () => {
    const py = 'dec = 10\nprint("Binary: {}".format(bin(dec)[2:]))\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('Leap_Year_Checker-shaped: `print("{0} is a leap year!!".format(year))`', () => {
    const py = 'year = 2000\nprint("{0} is a leap year!!".format(year))\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});

describe("Phase 9 — Calculate_age's end= line stays blocked, unchanged (regression guard)", () => {
  it('a print with BOTH a non-identifier value AND end= still fails, on the SAME end=-specific message', () => {
    const py = 'name = "Alice"\nyear = 30\nprint("%s is %d" % (name, year), end="")\n';
    const r = transpilePythonToEml(py);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("EML cannot express print's 'end' keyword argument");
  });
});
