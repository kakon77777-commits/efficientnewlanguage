import { describe, it, expect } from 'vitest';
import { transpileEmlToPython, analyzeSemantics, classifyLoops } from '@eml/transpiler-python';
import { parse } from '@eml/parser';
import { generateCts } from '@eml/cts-generator';
import type { CtsLoop } from '@eml/types';

const loopsOf = (src: string): CtsLoop[] => transpileEmlToPython(src).metadata.loops;
const kind = (loops: CtsLoop[], k: string): CtsLoop | undefined => loops.find((l) => l.loopKind === k);

describe('Phase 4 — loopKind classification', () => {
  it('tags Σ as algebraic_sum (deterministic, terminating)', () => {
    const l = kind(loopsOf('Σ(i^2, i in [1:N]) => r\n'), 'algebraic_sum')!;
    expect(l).toBeDefined();
    expect(l.deterministic).toBe(true);
    expect(l.terminating).toBe(true);
    expect(l.source).toContain('Σ');
  });

  it('tags a range iteration as basic_repeat', () => {
    const l = kind(loopsOf('i in [1:10] => m\n'), 'basic_repeat')!;
    expect(l).toBeDefined();
    expect(l.deterministic).toBe(true);
    expect(l.terminating).toBe(true);
  });

  it('tags a self-recursive function as recursive (deterministic, not provably terminating)', () => {
    const l = kind(loopsOf('def fact(n):\n    fact(n) => r\n    return r\n'), 'recursive')!;
    expect(l).toBeDefined();
    expect(l.ref).toBe('fact');
    expect(l.deterministic).toBe(true);
    expect(l.terminating).toBe(false);
  });

  it('detects mutual recursion (a -> b -> a)', () => {
    const loops = loopsOf('def a(n):\n    b(n) => r\n    return r\n\ndef b(n):\n    a(n) => r\n    return r\n');
    const recs = loops.filter((l) => l.loopKind === 'recursive').map((l) => l.ref).sort();
    expect(recs).toEqual(['a', 'b']);
  });

  it('tags a @temporal_loop function as temporal (non-deterministic, terminating)', () => {
    const l = kind(loopsOf('@temporal_loop(max_wait=1)\nasync def w(f):\n    await temporal_wait(f)\n    return f\n'), 'temporal')!;
    expect(l).toBeDefined();
    expect(l.ref).toBe('w');
    expect(l.deterministic).toBe(false);
    expect(l.terminating).toBe(true);
  });

  it('detects a Σ inside a function body', () => {
    const loops = loopsOf('def f(N):\n    Σ(i^2, i in [1:N]) => r\n    return r\n');
    expect(kind(loops, 'algebraic_sum')).toBeDefined();
  });

  it('reports no loops for a loop-free program', () => {
    expect(loopsOf('x^+1\nx^0\n')).toEqual([]);
  });

  it('classifies at least 3 distinct loop kinds in one program (Phase 4 criterion)', () => {
    const loops = loopsOf(
      'Σ(i^2, i in [1:N]) => s\n\ndef fact(n):\n    fact(n) => r\n    return r\n\n@temporal_loop(max_wait=1)\nasync def w(f):\n    await temporal_wait(f)\n    return f\n',
    );
    const kinds = new Set(loops.map((l) => l.loopKind));
    expect(kinds.size).toBeGreaterThanOrEqual(3);
  });

  it('exposes loops through generateCts', () => {
    const src = 'Σ(i^2, i in [1:N]) => r\n';
    const r = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
      loops: r.metadata.loops,
    });
    expect(cts.loops.some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });

  it('classifyLoops is callable directly on a parsed program', () => {
    const program = parse('Σ(i, i in [1:5]) => r\n');
    const loops = classifyLoops(program, []);
    expect(loops[0]!.loopKind).toBe('algebraic_sum');
  });

  // Review regressions:
  it('a loop source skips the decorator line and shows the def/async-def header', () => {
    const loops = loopsOf('@temporal_loop(max_wait=1)\nasync def poll(s):\n    await temporal_wait(s)\n    return s\n');
    const t = kind(loops, 'temporal')!;
    expect(t.source.startsWith('@')).toBe(false);
    expect(t.source).toContain('async def poll');
  });

  it('a decorated recursive function shows its def header as source (not @cold)', () => {
    const loops = loopsOf('@cold\ndef fact(n):\n    fact(n) => r\n    return r\n');
    expect(kind(loops, 'recursive')!.source).toBe('def fact(n):');
  });

  it('does not collapse same-named functions: recursive def first, plain second -> exactly 1 recursive', () => {
    const loops = loopsOf('def f(n):\n    f(n) => r\n    return r\n\ndef f(n):\n    return n\n');
    expect(loops.filter((l) => l.loopKind === 'recursive')).toHaveLength(1);
  });

  it('does not fabricate recursion: plain def first, recursive second -> exactly 1 recursive', () => {
    const loops = loopsOf('def f(n):\n    return n\n\ndef f(n):\n    f(n) => r\n    return r\n');
    expect(loops.filter((l) => l.loopKind === 'recursive')).toHaveLength(1);
  });

  it('a function that calls a recursive function is not itself tagged recursive', () => {
    const loops = loopsOf('def g(n):\n    g(n) => r\n    return r\n\ndef caller(n):\n    g(n) => r\n    return r\n');
    const recs = loops.filter((l) => l.loopKind === 'recursive').map((l) => l.ref);
    expect(recs).toEqual(['g']); // caller calls g but does not loop back to caller
  });
});
