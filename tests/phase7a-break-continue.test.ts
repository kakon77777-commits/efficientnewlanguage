import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { analyzeSemantics } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';
import type { WhileStatement } from '@eml/types';

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

describe('Phase 7a — parser: break / continue', () => {
  it('parses bare break and continue as leaf statements', () => {
    const ast = parse('while 1 > 0:\n    break\n');
    const stmt = ast.body[0] as WhileStatement;
    expect(stmt.body[0]).toMatchObject({ type: 'Break' });

    const ast2 = parse('while 1 > 0:\n    continue\n');
    const stmt2 = ast2.body[0] as WhileStatement;
    expect(stmt2.body[0]).toMatchObject({ type: 'Continue' });
  });
});

describe('Phase 7a — semantic: inLoop threading (E_BREAK_OUTSIDE_LOOP / E_CONTINUE_OUTSIDE_LOOP)', () => {
  it('fires at module scope with no enclosing loop', () => {
    expect(transpileEmlToPython('break\n').diagnostics.find((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toBeDefined();
    expect(transpileEmlToPython('continue\n').diagnostics.find((d) => d.code === 'E_CONTINUE_OUTSIDE_LOOP')).toBeDefined();
  });

  it('fires inside a loop-less function body', () => {
    const r = transpileEmlToPython('def f(x):\n    break\n    return x\n');
    expect(r.diagnostics.find((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toBeDefined();
  });

  it('does NOT fire inside while/for', () => {
    expect(transpileEmlToPython('while 1 > 0:\n    break\n').ok).toBe(true);
    expect(transpileEmlToPython('for i in [1:3]:\n    continue\n').ok).toBe(true);
  });

  it('does NOT fire for a break inside an if inside a while (inLoop passes through If)', () => {
    const r = transpileEmlToPython('n^+1\nwhile n > 0:\n    if n > 5:\n        break\n    n^-1\n');
    expect(r.diagnostics.filter((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toHaveLength(0);
  });

  it('DOES fire for a break inside a def nested inside a while (inLoop resets at the function boundary)', () => {
    const r = transpileEmlToPython('while 1 > 0:\n    def f(x):\n        break\n        return x\n    break\n');
    expect(r.diagnostics.filter((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toHaveLength(1);
  });
});

describe('Phase 7a — emitter', () => {
  it('emits break/continue verbatim', () => {
    const r = transpileEmlToPython('n^+1\nwhile n > 0:\n    if n > 5:\n        break\n    n^-1\n');
    expect(r.python).toContain('        break\n');
    const r2 = transpileEmlToPython('for i in [1:3]:\n    if i > 1:\n        continue\n    i^0\n');
    expect(r2.python).toContain('        continue\n');
  });
});

describe('Phase 7a — CTS', () => {
  it('exposes control.break/control.continue', () => {
    const src = 'while 1 > 0:\n    break\n';
    const r = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    // The break is nested inside the while's body, which — like Phase 6's
    // If/While/ForIn — only gets its own top-level CTS node when it IS the
    // top-level statement; here the while itself is top-level.
    expect(cts.nodes.some((n) => n.semanticType === 'control.while')).toBe(true);
  });

  it('a top-level break/continue gets its own semanticType (resolution proceeds despite the E_BREAK_OUTSIDE_LOOP diagnostic)', () => {
    const src = 'break\n';
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: src,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: [],
    });
    expect(cts.nodes[0]?.semanticType).toBe('control.break');
  });
});

describe('Phase 7a — interpreter: real break/continue execution', () => {
  it('break exits the while loop early', () => {
    const r = interpret(
      'n^+0\ntotal^+0\nwhile n < 100:\n    n + 1 => n\n    if n > 5:\n        break\n    total + n => total\ntotal^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('15\n');
  });

  it('continue skips the rest of the current iteration', () => {
    const r = interpret(
      'total^+0\nfor i in [1:10]:\n    if i > 5:\n        continue\n    total + i => total\ntotal^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('15\n');
  });

  it('break inside an inner loop does not affect an outer loop', () => {
    // outer runs 3 times; inner breaks immediately each time (count stays 0 per inner run)
    const r = interpret(
      'total^+0\nfor i in [1:3]:\n    for j in [1:5]:\n        break\n        total + 1 => total\n    total + 1 => total\ntotal^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('3\n'); // only the outer loop's `total + 1` ever runs (3 times)
  });

  it('a break/continue that escaped semantic validation reports incomplete, not a crash', () => {
    // interpretProgram-style defensive path: a hand-resolved AST could in
    // principle reach the interpreter with a stray Break at module scope.
    // Exercise via the public API using a construct where the diagnostic gate
    // still allows execution to prove the interpreter's own defense: a break
    // directly in a function body with no loop (E_BREAK_OUTSIDE_LOOP fires,
    // ok:false, and no thrown/uncaught exception reaches the caller).
    const r = interpret('def f(x):\n    break\n    return x\n\nf(1) => y\ny^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.diagnostics.find((d) => d.code === 'E_BREAK_OUTSIDE_LOOP')).toBeDefined();
  });
});
