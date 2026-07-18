import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { parsePython, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension: Python list comprehensions (real B-6 corpus gap:
 * `Duplicate_files_remover`'s `filelist = [f for f in os.listdir() if
 * os.path.isfile(f)]`, the LAST unnumbered candidate in this whole language-
 * extension track). Exactly one `for` clause, one optional `if` filter — no
 * nested comprehensions, no multiple filters (no corpus evidence for either).
 * Bidirectional by explicit choice (Neo, via AskUserQuestion): forward EML has
 * always copied Python's own control-flow keywords verbatim (`for...in`,
 * `if/elif/else`, `try/except`, `with`, `class`), so `[expr for x in iterable
 * if cond]` gets the same treatment, not a from-scratch invented sigil like
 * `print`'s `end=`. A new `ListComprehension` AST node — `iterable` is a
 * general `Expression` (unlike `SumExpression`, which only ever iterates a
 * numeric `RangeExpression`) — mirrors `SumExpression`'s existing "don't
 * scope-track the bound iterator at all, delegate to the target language's own
 * non-leaking construct" precedent: no semantic walker ever declares `iterator`
 * into any scope. See docs/agent-handoff.md "Phase 9" section.
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

describe('Phase 9 — forward parser: list comprehensions', () => {
  it('parses `[x for x in lst]` (no filter)', () => {
    const ast = parse('lst^+[1,2,3]\n[x for x in lst] => doubled\n');
    const stmt = ast.body[1] as { value: unknown };
    expect(stmt.value).toMatchObject({
      type: 'ListComp',
      expr: { type: 'Identifier', name: 'x' },
      iterator: { type: 'Identifier', name: 'x' },
      iterable: { type: 'Identifier', name: 'lst' },
      condition: undefined,
    });
  });

  it('parses `[x for x in lst if x > 1]` (with filter)', () => {
    const ast = parse('lst^+[1,2,3]\n[x for x in lst if x > 1] => big\n');
    const stmt = ast.body[1] as { value: { condition?: unknown } };
    expect(stmt.value.condition).toMatchObject({ type: 'Comparison', op: '>' });
  });

  it('a plain list `[1,2,3]` still parses unchanged (regression)', () => {
    const ast = parse('lst^+[1,2,3]\n');
    const stmt = ast.body[0] as { value: unknown };
    expect(stmt.value).toMatchObject({ type: 'List', elements: [{ raw: '1' }, { raw: '2' }, { raw: '3' }] });
  });

  it('a Range `[a:b]` still parses unchanged (regression)', () => {
    const ast = parse('for i in [0:2]:\n    i^0\n');
    const stmt = ast.body[0] as { iterable: unknown };
    expect(stmt.iterable).toMatchObject({ type: 'Range' });
  });
});

describe('Phase 9 — forward emit: list comprehensions round-trip as Python-identical syntax', () => {
  it('emits `[x for x in lst]` verbatim', () => {
    const r = transpileEmlToPython('lst^+[1,2,3]\n[x for x in lst] => doubled\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('[x for x in lst]');
  });

  it('emits `[x for x in lst if x > 1]` verbatim', () => {
    const r = transpileEmlToPython('lst^+[1,2,3]\n[x for x in lst if x > 1] => big\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('[x for x in lst if x > 1]');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: list comprehensions', () => {
  it('transforms the bound variable: `[x*2 for x in [1,2,3]]`', () => {
    const src = 'lst^+[1,2,3]\n[x*2 for x in lst] => doubled\ndoubled^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('[2, 4, 6]');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('[2, 4, 6]');
  });

  it('filters with `if`: `[x for x in [1,2,3,4,5] if x % 2 == 0]`', () => {
    const src = 'lst^+[1,2,3,4,5]\n[x for x in lst if x % 2 == 0] => evens\nevens^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('[2, 4]');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('[2, 4]');
  });

  it('iterates a string (matches Python character-by-character iteration)', () => {
    const src = 's^+"abc"\n[c for c in s] => chars\nchars^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe("['a', 'b', 'c']");
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe("['a', 'b', 'c']");
  });
});

describe('Phase 9 — interpreter: the bound iterator does NOT leak into the enclosing scope', () => {
  it('reading `x` after `[x for x in lst]` raises NameError (matches real Python 3 comprehension scoping)', () => {
    const r = interpret('lst^+[1,2,3]\n[x for x in lst] => doubled\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('NameError');
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('rejects a list comprehension with E_CPP_UNSUPPORTED', () => {
    const r = transpileEmlToCpp('lst^+[1,2,3]\n[x for x in lst] => doubled\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });

  it('self-recursion hidden inside a comprehension is still detected (expressionCallsName must not miss it)', () => {
    const r = transpileEmlToCpp('def fact(n):\n    [fact(x) for x in lst] => r\n    return r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
    // Must fail on the RECURSION check (which runs before body emission), not silently pass it
    // and fail later on a generic "not supported" rejection — that would mean
    // expressionCallsName's ListComp case failed to recurse into `expr`.
    expect(r.diagnostics[0]?.message).toContain('Recursive function');
  });
});

describe('Phase 9 — reverse Python->EML: list comprehension round-trip', () => {
  it('the exact Duplicate_files_remover-shaped snippet round-trips', () => {
    const py = 'filelist = [f for f in os.listdir() if os.path.isfile(f)]\nprint(filelist)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('reverse-parses the corpus-exact line directly into a ListComp shape', () => {
    const ast = parsePython('filelist = [f for f in os.listdir() if os.path.isfile(f)]\n');
    const stmt = ast.body[0] as { value: { type: string; iterator: { name: string }; condition?: unknown } };
    expect(stmt.value.type).toBe('ListComp');
    expect(stmt.value.iterator.name).toBe('f');
    expect(stmt.value.condition).toBeDefined();
  });

  it('a no-filter comprehension round-trips too', () => {
    const py = 'lst = [1, 2, 3]\ndoubled = [x * 2 for x in lst]\nprint(doubled)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
