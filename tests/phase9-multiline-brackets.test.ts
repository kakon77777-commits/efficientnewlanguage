import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse, lex, normalizeSource } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { lexPython, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension, item 7: multi-line bracketed literals (real
 * B-6 corpus gap: `text_to_morse_code`'s dict literal spanning lines 2-29).
 * The last originally-numbered Phase 9 roadmap item. Confirmed by direct
 * research before implementing: purely lexer-level (zero AST/parser/
 * semantic-walker/interpreter/emitter impact), the same shape as item 4
 * (triple-quoted strings) — neither lexer had ANY bracket-depth tracking, so
 * every `\n` unconditionally became a NEWLINE + indentation check, even
 * mid-literal. See docs/agent-handoff.md "Phase 9" section, item 7.
 *
 * Also ships trailing-comma support (`[1, 2,]`, `{k: v,}`, `f(a, b,)`) in
 * both parsers — a real, previously-uncaught gap discovered while testing
 * THIS exact feature against the real corpus file: `text_to_morse_code`'s
 * dict literal ends its last entry with a trailing comma before the closing
 * `}` (ordinary real-world Python style), so the bracket-depth fix alone
 * still didn't fully unblock it. Small and tightly coupled enough to include
 * in this same round rather than deferring, unlike the larger, independent
 * gaps (Python slice syntax, list comprehensions) that got logged separately
 * instead of folded in.
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

describe('Phase 9 — forward lexer/parser: multi-line bracketed literals', () => {
  it('parses a multi-line dict literal', () => {
    const src = '{\n    "a": 1,\n    "b": 2,\n} => d\nd^0\n';
    const ast = parse(src);
    const stmt = ast.body[0] as { type: string; value?: { type: string; entries?: unknown[] } };
    expect(stmt.type).toBe('Assignment');
    expect(stmt.value).toMatchObject({ type: 'Dict' });
    expect(stmt.value!.entries).toHaveLength(2);
  });

  it('parses a multi-line list literal', () => {
    const src = '[\n    1,\n    2,\n    3,\n] => xs\nxs^0\n';
    const ast = parse(src);
    const stmt = ast.body[0] as { type: string; value?: { type: string; elements?: unknown[] } };
    expect(stmt.value).toMatchObject({ type: 'List' });
    expect(stmt.value!.elements).toHaveLength(3);
  });

  it('parses multi-line call arguments', () => {
    const src = 'def add(a, b):\n    return a + b\n\nadd(\n    1,\n    2,\n) => r\nr^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = add(1, 2)');
  });

  it('a blank line and a comment inside a multi-line dict do not break parsing', () => {
    const src = '{\n    "a": 1,\n\n    # a comment\n    "b": 2,\n} => d\nd^0\n';
    const ast = parse(src);
    const stmt = ast.body[0] as { type: string; value?: { type: string; entries?: unknown[] } };
    expect(stmt.value).toMatchObject({ type: 'Dict' });
    expect(stmt.value!.entries).toHaveLength(2);
  });

  it('a trailing comma is accepted on a SINGLE-line list/dict/call too (not just multi-line)', () => {
    expect((parse('[1, 2, 3,] => xs\nxs^0\n').body[0] as { value: { elements: unknown[] } }).value.elements).toHaveLength(3);
    expect((parse('{"a": 1, "b": 2,} => d\nd^0\n').body[0] as { value: { entries: unknown[] } }).value.entries).toHaveLength(2);
    const r = transpileEmlToPython('def add(a, b):\n    return a + b\n\nadd(1, 2,) => r\nr^0\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = add(1, 2)');
  });

  it('nested multi-line brackets (a dict whose value is a multi-line list) parse correctly', () => {
    const src = '{\n    "a": [\n        1,\n        2,\n    ],\n} => d\nd^0\n';
    const ast = parse(src);
    const stmt = ast.body[0] as {
      type: string;
      value?: { type: string; entries?: Array<{ value: { type: string; elements: unknown[] } }> };
    };
    expect(stmt.value).toMatchObject({ type: 'Dict' });
    const nested = stmt.value!.entries![0]!.value;
    expect(nested.type).toBe('List');
    expect(nested.elements).toHaveLength(2);
  });

  it('the forward lexer emits no spurious INDENT/DEDENT/NEWLINE tokens inside a multi-line dict', () => {
    const src = '{\n    "a": 1,\n    "b": 2,\n} => d\nd^0\n';
    const tokens = lex(normalizeSource(src));
    const lbrace = tokens.findIndex((t) => t.type === 'LBRACE');
    const rbrace = tokens.findIndex((t) => t.type === 'RBRACE');
    const between = tokens.slice(lbrace + 1, rbrace);
    expect(between.some((t) => t.type === 'NEWLINE' || t.type === 'INDENT' || t.type === 'DEDENT')).toBe(false);
  });

  it('the reverse lexer emits no spurious INDENT/DEDENT/NEWLINE tokens inside a multi-line dict', () => {
    const py = 'symbols = {\n    "a": ".-",\n    "b": "-...",\n}\nprint(symbols)\n';
    const tokens = lexPython(py);
    const lbrace = tokens.findIndex((t) => t.type === 'LBRACE');
    const rbrace = tokens.findIndex((t) => t.type === 'RBRACE');
    const between = tokens.slice(lbrace + 1, rbrace);
    expect(between.some((t) => t.type === 'NEWLINE' || t.type === 'INDENT' || t.type === 'DEDENT')).toBe(false);
  });
});

describe.skipIf(!PYTHON)('Phase 9 — forward emit: multi-line literal executes correctly', () => {
  it('a multi-line dict literal transpiles and executes identically to real Python', () => {
    const src = '{\n    "a": 1,\n    "b": 2,\n} => d\nd^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe("{'a': 1, 'b': 2}");
  });
});

describe('Phase 9 — reverse Python->EML: multi-line literal round-trip', () => {
  it('a text_to_morse_code-shaped multi-line dict literal round-trips', () => {
    const py = 'symbols = {\n    "a": ".-",\n    "b": "-...",\n    "c": "-.-.",\n}\nprint(symbols)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a multi-line list literal round-trips', () => {
    const py = 'xs = [\n    1,\n    2,\n    3,\n]\nprint(xs)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
