import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { parsePython, roundTripFromPython } from '@eml/transpiler-eml';

/**
 * Phase 9 — language extension: Python slice syntax (real B-6 corpus gap:
 * `Decimal_to_binary_convertor`'s `bin(dec)[2:]`). Directly fetched the real
 * file (Python-World/python-mini-projects) to confirm the ONLY form it needs
 * is start-only, no stop, no step. Bidirectional by explicit choice (Neo, via
 * AskUserQuestion): forward EML's postfix `obj[...]` had zero colon-detection
 * before this round (an empty, collision-free grammar slot), so it now learns
 * `obj[a:b]` / `obj[a:]` / `obj[:b]` / `obj[:]` too, not just the reverse
 * transpiler. A new `SliceExpression` AST node (NOT a reuse of `RangeExpression`
 * — its bounds are optional, unlike Range's mandatory `start`/`end`), used only
 * as a `Subscript`'s `index`. No step form: EML's own `[a:b]` Range has no step
 * concept, and no corpus evidence needs one. See docs/agent-handoff.md "Phase 9"
 * section.
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

describe('Phase 9 — forward parser: slice syntax', () => {
  it('parses `x[2:]` (start only) as a Subscript with a Slice index', () => {
    const ast = parse('lst^+[1,2,3]\nlst[2:] => sub\n');
    const stmt = ast.body[1] as { value: unknown };
    expect(stmt.value).toMatchObject({
      type: 'Subscript',
      object: { type: 'Identifier', name: 'lst' },
      index: { type: 'Slice', start: { type: 'NumberLiteral', raw: '2' }, stop: undefined },
    });
  });

  it('parses `x[:2]` (stop only)', () => {
    const ast = parse('lst^+[1,2,3]\nlst[:2] => sub\n');
    const stmt = ast.body[1] as { value: { index: { start?: unknown; stop?: unknown } } };
    expect(stmt.value.index.start).toBeUndefined();
    expect(stmt.value.index).toMatchObject({ type: 'Slice', stop: { type: 'NumberLiteral', raw: '2' } });
  });

  it('parses `x[1:2]` (both bounds)', () => {
    const ast = parse('lst^+[1,2,3]\nlst[1:2] => sub\n');
    const stmt = ast.body[1] as { value: { index: unknown } };
    expect(stmt.value.index).toMatchObject({
      type: 'Slice',
      start: { type: 'NumberLiteral', raw: '1' },
      stop: { type: 'NumberLiteral', raw: '2' },
    });
  });

  it('parses `x[:]` (neither bound)', () => {
    const ast = parse('lst^+[1,2,3]\nlst[:] => sub\n');
    const stmt = ast.body[1] as { value: { index: { start?: unknown; stop?: unknown } } };
    expect(stmt.value.index).toMatchObject({ type: 'Slice' });
    expect(stmt.value.index.start).toBeUndefined();
    expect(stmt.value.index.stop).toBeUndefined();
  });

  it('a plain `x[0]` (no colon) still parses as a normal index, not a Slice', () => {
    const ast = parse('lst^+[1,2,3]\nlst[0] => x\n');
    const stmt = ast.body[1] as { value: { index: unknown } };
    expect(stmt.value.index).toMatchObject({ type: 'NumberLiteral', raw: '0' });
  });
});

describe('Phase 9 — forward emit: slice round-trips as Python-identical syntax', () => {
  it('emits `x[2:]` verbatim', () => {
    const r = transpileEmlToPython('lst^+[1,2,3,4,5]\nlst[2:] => sub\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('lst[2:]');
  });

  it('emits `x[:2]` verbatim', () => {
    const r = transpileEmlToPython('lst^+[1,2,3,4,5]\nlst[:2] => sub\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('lst[:2]');
  });

  it('emits `x[:]` verbatim', () => {
    const r = transpileEmlToPython('lst^+[1,2,3,4,5]\nlst[:] => sub\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('lst[:]');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity: slicing', () => {
  it('string slicing: `"hello"[1:]`', () => {
    const src = 's^+"hello"\ns[1:] => sub\nsub^0\n';
    const r = transpileEmlToPython(src);
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(pythonStdout(r.python)).toBe('ello');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('ello');
  });

  it('string slicing: `"hello"[:3]`', () => {
    const src = 's^+"hello"\ns[:3] => sub\nsub^0\n';
    const r = transpileEmlToPython(src);
    expect(pythonStdout(r.python)).toBe('hel');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('hel');
  });

  it('string slicing: `"hello"[1:3]`', () => {
    const src = 's^+"hello"\ns[1:3] => sub\nsub^0\n';
    const r = transpileEmlToPython(src);
    expect(pythonStdout(r.python)).toBe('el');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('el');
  });

  it('list slicing: `[1,2,3,4,5][1:3]`', () => {
    const src = 'lst^+[1,2,3,4,5]\nlst[1:3] => sub\nsub^0\n';
    const r = transpileEmlToPython(src);
    expect(pythonStdout(r.python)).toBe('[2, 3]');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('[2, 3]');
  });

  it('negative-index bound: `[1,2,3,4,5][-2:]`', () => {
    const src = 'lst^+[1,2,3,4,5]\nlst[-2:] => sub\nsub^0\n';
    const r = transpileEmlToPython(src);
    expect(pythonStdout(r.python)).toBe('[4, 5]');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('[4, 5]');
  });

  it('out-of-range clamping: `[1,2,3][:100]` (never IndexError, matches real Python)', () => {
    const src = 'lst^+[1,2,3]\nlst[:100] => sub\nsub^0\n';
    const r = transpileEmlToPython(src);
    expect(pythonStdout(r.python)).toBe('[1, 2, 3]');
    expect(interpret(src, { now: FIXED_CLOCK }).output.trimEnd()).toBe('[1, 2, 3]');
  });

  it('the exact Decimal_to_binary_convertor form: `bin(dec)[2:]`', () => {
    const py = 'dec = 10\nprint("Binary: {}".format(bin(dec)[2:]))\n';
    expect(pythonStdout(py)).toBe('Binary: 1010');
  });
});

describe('Phase 9 — interpreter: slice assignment is deferred, not silently mishandled', () => {
  it('`lst[1:2] => v` (slice as an assignment target) raises Unsupported, not a corrupted write', () => {
    const r = interpret('lst^+[1,2,3]\n9 => lst[1:2]\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    // Deferred to real Python — not modeled here, but must fail loud, not silently misbehave.
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('rejects a slice subscript with E_CPP_UNSUPPORTED', () => {
    const r = transpileEmlToCpp('lst^+[1,2,3]\nlst[1:] => x\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });

  it('self-recursion hidden inside a slice bound is still detected (expressionCallsName must not miss it)', () => {
    const r = transpileEmlToCpp('def fact(n):\n    lst[fact(n):] => r\n    return r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
    // Must fail on the RECURSION check (which runs before body emission), not silently pass
    // it and fail later on the (also-true) "Subscript access is not supported" rejection —
    // that would mean expressionCallsName's Slice case failed to recurse into `start`.
    expect(r.diagnostics[0]?.message).toContain('Recursive function');
  });
});

describe('Phase 9 — reverse Python->EML: slice round-trip', () => {
  it('slice itself round-trips fully when not wrapped in a non-identifier print', () => {
    // Isolates slice from a SEPARATE, pre-existing limitation (below): EML's `^0`
    // can only print a bare identifier, never an inline expression/call — assigning
    // to a variable first sidesteps that unrelated restriction entirely.
    const py = 'dec = 10\nbinary = bin(dec)[2:]\nprint(binary)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('the EXACT Decimal_to_binary_convertor line round-trips fully (once a separate, later '
    + 'round relaxed `^0`\'s bare-identifier restriction — see phase9-output-any-expression.test.ts)', () => {
    const py = 'dec = 10\nbinary = bin(dec)[2:]\nprint("Binary: {}".format(binary))\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('reverse-parses `bin(dec)[2:]` directly into a Subscript/Slice shape', () => {
    const ast = parsePython('dec = 10\nx = bin(dec)[2:]\n');
    const stmt = ast.body[1] as { value: { type: string; index: { type: string; start: unknown; stop: unknown } } };
    expect(stmt.value.type).toBe('Subscript');
    expect(stmt.value.index).toMatchObject({ type: 'Slice', stop: undefined });
    expect(stmt.value.index.start).toBeDefined();
  });

  it('a two-bound slice round-trips too', () => {
    const py = 's = "hello world"\nx = s[1:5]\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });
});
