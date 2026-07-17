import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse, lex, normalizeSource } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';
import { lexPython, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension, item 4: triple-quoted strings `'''...'''` /
 * `"""..."""` (real B-6 corpus gap: `Leap_Year_Checker`'s bare docstrings).
 * Confirmed by direct research before implementing (not assumed): this is
 * lexer-only — `StringLiteral` has no quote-style flag, so every parser/
 * emitter/semantic-walker/interpreter consumer already treats a triple-quoted
 * string identically to a regular one once lexed. See docs/agent-handoff.md
 * "Phase 9" section, item 4.
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
  return r.stdout.replace(/\r\n/g, '\n');
}

describe('Phase 9 — forward lexer/parser: triple-quoted strings', () => {
  it('`\'\'\'...\'\'\'` lexes as a plain StringLiteral', () => {
    const ast = parse("'''hello'''\n");
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.type).toBe('ExpressionStatement');
    expect(stmt.expression).toMatchObject({ type: 'StringLiteral', value: 'hello' });
  });

  it('`"""..."""` lexes as a plain StringLiteral', () => {
    const ast = parse('"""hello"""\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'StringLiteral', value: 'hello' });
  });

  it('an embedded literal newline is preserved as real string content', () => {
    const ast = parse('"""line1\nline2"""\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'StringLiteral', value: 'line1\nline2' });
  });

  it('a single stray quote character does not prematurely close the string', () => {
    const ast = parse('"""He said "hi" once"""\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'StringLiteral', value: 'He said "hi" once' });
  });

  it('an empty triple-quoted string `""""""`  lexes to an empty value', () => {
    const ast = parse('""""""\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'StringLiteral', value: '' });
  });

  it('a multi-line docstring inside a function body does NOT emit spurious INDENT/DEDENT tokens', () => {
    const src = 'def f():\n    """\n    doc\n    line2\n    """\n    return 1\n';
    const tokens = lex(normalizeSource(src));
    const indents = tokens.filter((t) => t.type === 'INDENT').length;
    const dedents = tokens.filter((t) => t.type === 'DEDENT').length;
    expect(indents).toBe(1);
    expect(dedents).toBe(1);
  });

  it('the reverse lexer also does not emit spurious INDENT/DEDENT tokens for a multi-line docstring', () => {
    const py = 'def f():\n    """\n    doc\n    line2\n    """\n    return 1\n';
    const tokens = lexPython(py);
    const indents = tokens.filter((t) => t.type === 'INDENT').length;
    const dedents = tokens.filter((t) => t.type === 'DEDENT').length;
    expect(indents).toBe(1);
    expect(dedents).toBe(1);
  });
});

describe.skipIf(!PYTHON)('Phase 9 — forward emit: docstring round-trips through real Python execution', () => {
  it('an embedded newline re-emits as a valid escaped Python string and executes identically', () => {
    const src = 's^+"""line1\nline2"""\ns^0';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    // The re-emitted Python source itself must escape the embedded newline
    // (not leave it as a literal linebreak splitting the statement) —
    // verified by shape, then by executing it and confirming the RUNTIME
    // string value still contains a real newline (round-trips the actual
    // value, not just the source text).
    expect(r.python).toContain('s = "line1\\nline2"');
    expect(pythonStdout(r.python)).toBe('line1\nline2\n');
    expect(interpret(src).output).toBe('line1\nline2\n');
  });
});

describe('Phase 9 — reverse Python->EML: docstring round-trip', () => {
  it('a Leap_Year_Checker-shaped bare docstring inside an if/else body round-trips', () => {
    // `print("leap")` (a literal string argument) hits EML's pre-existing,
    // unrelated `^0`-requires-a-bare-identifier limitation — bind first,
    // mirroring how every prior phase's round-trip tests handle this.
    const py =
      'year = 2000\n' +
      'if year % 4 == 0:\n' +
      '    """\n' +
      '    if a year is a multiple of four it is a leap year\n' +
      '    """\n' +
      '    msg = "leap"\n' +
      '    print(msg)\n' +
      'else:\n' +
      '    msg = "not leap"\n' +
      '    print(msg)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a single-quoted triple docstring `\'\'\'...\'\'\'` round-trips too', () => {
    const py = "x = 1\nif x:\n    '''doc'''\n    print(x)\n";
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
