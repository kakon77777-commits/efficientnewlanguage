import { describe, it, expect } from 'vitest';
import { parse, lex, normalizeSource } from '@eml/parser';
import {
  transpileEmlToPython,
  analyzeSemantics,
  CrystalCache,
  hashFunction,
  checkPurity,
} from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import type { FunctionDef } from '@eml/types';

const COLD = `@cold
def square_sum(N):
    Σ(i^2, i in [1:N]) => r
    return r

square_sum(100) => total
total^0
`;

const HOT = `@hot
def greet(name):
    name^0
    return name
`;

describe('Phase 2 — parser: decorators, def, return, blocks', () => {
  it('parses a decorated function with params, body, and resolved temperature', () => {
    const ast = parse(COLD);
    const fn = ast.body[0] as FunctionDef;
    expect(fn.type).toBe('FunctionDef');
    expect(fn.name).toBe('square_sum');
    expect(fn.params.map((p) => p.name)).toEqual(['N']);
    expect(fn.decorators.map((d) => d.name)).toEqual(['cold']);
    expect(fn.temperature).toBe('cold');
    expect(fn.body).toHaveLength(2);
    expect(fn.body[1].type).toBe('Return');
  });

  it('parses a bare return and a return with a value', () => {
    const ast = parse('def f(x):\n    return\n\ndef g(x):\n    return x\n');
    const f = ast.body[0] as FunctionDef;
    const g = ast.body[1] as FunctionDef;
    expect(f.body[0]).toEqual({ type: 'Return', span: expect.anything() });
    expect((g.body[0] as { type: string }).type).toBe('Return');
    expect((g.body[0] as { value?: unknown }).value).toBeDefined();
  });

  it('emits INDENT/DEDENT only around indented blocks (top level unaffected)', () => {
    const flat = lex(normalizeSource('x^+1\nx^0\n')).map((t) => t.type);
    expect(flat).not.toContain('INDENT');
    expect(flat).not.toContain('DEDENT');
    const blocky = lex(normalizeSource(COLD)).map((t) => t.type);
    expect(blocky).toContain('INDENT');
    expect(blocky).toContain('DEDENT');
  });

  it('rejects an empty function body', () => {
    const r = transpileEmlToPython('def f(x):\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });

  it('rejects inconsistent indentation', () => {
    const r = transpileEmlToPython('def f(x):\n    return x\n  return x\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_LEX');
  });
});

describe('Phase 2 — emitter: @cold/@hot, def, return', () => {
  it('@cold becomes @functools.cache with an auto import', () => {
    const r = transpileEmlToPython(COLD);
    expect(r.ok).toBe(true);
    expect(r.imports).toContain('import functools');
    expect(r.python).toContain('@functools.cache');
    expect(r.python).toContain('def square_sum(N):');
    expect(r.python).toContain('    r = sum(i**2 for i in range(1, N+1))');
    expect(r.python).toContain('    return r');
  });

  it('@hot becomes a marker comment, not a cache decorator', () => {
    const r = transpileEmlToPython(HOT);
    expect(r.ok).toBe(true);
    expect(r.python).toContain('# @hot');
    expect(r.python).not.toContain('@functools.cache');
    expect(r.imports).not.toContain('import functools');
  });
});

describe('Phase 2 — purity checker (cold/hot separation)', () => {
  it('a pure @cold function produces no side-effect warning', () => {
    const r = transpileEmlToPython(COLD);
    expect(r.diagnostics.filter((d) => d.code === 'W_COLD_SIDE_EFFECT')).toHaveLength(0);
    expect(r.metadata.functions[0].pure).toBe(true);
  });

  it('an impure @cold function warns (W_COLD_SIDE_EFFECT) but still transpiles', () => {
    const r = transpileEmlToPython('@cold\ndef f(x):\n    x^0\n    return x\n');
    expect(r.ok).toBe(true); // warning, not error
    const w = r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT');
    expect(w).toBeDefined();
    expect(r.metadata.functions[0].pure).toBe(false);
    expect(r.metadata.functions[0].sideEffects.length).toBeGreaterThan(0);
  });

  it('a @hot function with I/O is allowed (no purity warning)', () => {
    const r = transpileEmlToPython(HOT);
    expect(r.diagnostics.filter((d) => d.code === 'W_COLD_SIDE_EFFECT')).toHaveLength(0);
    expect(r.metadata.functions[0].temperature).toBe('hot');
    expect(r.metadata.functions[0].pure).toBe(false);
  });

  it('checkPurity flags impure builtin calls (input/open)', () => {
    const ast = parse('@cold\ndef f(x):\n    input(x) => y\n    return y\n');
    const fn = ast.body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });
});

describe('Phase 2 — decorator validation', () => {
  it('warns on an unknown decorator', () => {
    const r = transpileEmlToPython('@frob\ndef f(x):\n    return x\n');
    expect(r.diagnostics.find((d) => d.code === 'W_UNKNOWN_DECORATOR')).toBeDefined();
  });

  it('warns and prefers cold when @cold and @hot conflict', () => {
    const r = transpileEmlToPython('@cold\n@hot\ndef f(x):\n    return x\n');
    expect(r.diagnostics.find((d) => d.code === 'W_TEMP_CONFLICT')).toBeDefined();
    expect(r.metadata.functions[0].temperature).toBe('cold');
  });
});

describe('Phase 2 — return scope', () => {
  it('flags return outside a function', () => {
    const r = transpileEmlToPython('return 1\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.find((d) => d.code === 'E_RETURN_OUTSIDE_FN')).toBeDefined();
  });

  it('function params and locals do not leak to module scope', () => {
    const r = transpileEmlToPython(COLD);
    expect(r.metadata.declaredNames).toContain('square_sum');
    expect(r.metadata.declaredNames).toContain('total');
    expect(r.metadata.declaredNames).not.toContain('N');
    expect(r.metadata.declaredNames).not.toContain('r');
  });
});

describe('Phase 2 — crystallization (rule-based)', () => {
  it('hashes function logic independent of the function name', () => {
    const a = parse('def a(N):\n    return N\n').body[0] as FunctionDef;
    const b = parse('def b(N):\n    return N\n').body[0] as FunctionDef;
    const c = parse('def c(M):\n    return M\n').body[0] as FunctionDef;
    expect(hashFunction(a)).toBe(hashFunction(b)); // name-independent
    expect(hashFunction(a)).not.toBe(hashFunction(c)); // params/body differ
  });

  it('marks a repeated cold logic as a cache HIT within one program', () => {
    const src = `@cold\ndef a(N):\n    return N\n\n@cold\ndef b(N):\n    return N\n`;
    const r = transpileEmlToPython(src);
    expect(r.metadata.functions[0].cached).toBe(false); // first occurrence
    expect(r.metadata.functions[1].cached).toBe(true); // same logic -> hit
    expect(r.metadata.functions[0].astHash).toBe(r.metadata.functions[1].astHash);
  });

  it('a shared CrystalCache yields a hit on the second transpile run', () => {
    const cache = new CrystalCache();
    const src = '@cold\ndef a(N):\n    return N\n';
    const first = transpileEmlToPython(src, { crystalCache: cache });
    const second = transpileEmlToPython(src, { crystalCache: cache });
    expect(first.metadata.functions[0].cached).toBe(false);
    expect(second.metadata.functions[0].cached).toBe(true);
  });

  it('only cold functions are crystallized', () => {
    const r = transpileEmlToPython('def a(N):\n    return N\n\ndef b(N):\n    return N\n');
    expect(r.metadata.functions.every((f) => f.cached === false)).toBe(true);
  });
});

describe('Phase 2 — crystal cache persistence (serialize/deserialize)', () => {
  it('round-trips through toJSON/fromJSON, preserving hits and counts', () => {
    const cache = new CrystalCache();
    cache.store('aaaa1111');
    cache.store('aaaa1111'); // count 2
    cache.store('bbbb2222');
    const restored = CrystalCache.fromJSON(JSON.parse(JSON.stringify(cache.toJSON())));
    expect(restored.has('aaaa1111')).toBe(true);
    expect(restored.count('aaaa1111')).toBe(2);
    expect(restored.has('bbbb2222')).toBe(true);
    expect(restored.size).toBe(2);
  });

  it('a persisted cache yields a cache HIT for previously crystallized logic', () => {
    const src = '@cold\ndef a(N):\n    return N\n';
    const run1 = new CrystalCache();
    transpileEmlToPython(src, { crystalCache: run1 });
    // Simulate a separate process loading the persisted snapshot.
    const run2 = CrystalCache.fromJSON(JSON.parse(JSON.stringify(run1.toJSON())));
    const r = transpileEmlToPython(src, { crystalCache: run2 });
    expect(r.metadata.functions[0].cached).toBe(true);
  });

  it('fromJSON tolerates null and malformed input (-> empty cache)', () => {
    expect(CrystalCache.fromJSON(null).size).toBe(0);
    expect(CrystalCache.fromJSON({ garbage: true }).size).toBe(0);
    expect(CrystalCache.fromJSON({ entries: { h: -1 } }).size).toBe(0); // non-positive count ignored
  });

  it('clone is an independent copy (read-only check during live editing)', () => {
    const cache = new CrystalCache();
    cache.store('h1');
    const clone = cache.clone();
    clone.store('h2');
    expect(cache.has('h2')).toBe(false); // mutating the clone does not touch the original
    expect(clone.has('h1')).toBe(true);
  });
});

describe('Phase 2 — importance analyzer', () => {
  it('scores hot (risky) above cold-pure (safe)', () => {
    const cold = transpileEmlToPython(COLD).metadata.functions[0];
    const hot = transpileEmlToPython(HOT).metadata.functions[0];
    expect(hot.importance.riskLevel).toBeGreaterThan(cold.importance.riskLevel);
    expect(hot.importance.score).toBeGreaterThan(cold.importance.score);
  });

  it('counts call frequency across the whole program', () => {
    const src = `@cold\ndef sq(N):\n    return N\n\nsq(10) => a\nsq(20) => b\n`;
    const fn = transpileEmlToPython(src).metadata.functions[0];
    expect(fn.importance.callFrequency).toBe(2);
  });

  it('computes dependency depth through a call graph', () => {
    const src = `@cold\ndef inner(x):\n    return x\n\n@cold\ndef outer(y):\n    inner(y) => z\n    return z\n`;
    const fns = transpileEmlToPython(src).metadata.functions;
    const inner = fns.find((f) => f.name === 'inner')!;
    const outer = fns.find((f) => f.name === 'outer')!;
    expect(inner.importance.dependencyDepth).toBe(1);
    expect(outer.importance.dependencyDepth).toBe(2);
  });
});

describe('Phase 2 — adversarial-review regressions (soundness)', () => {
  // A: a function named after a builtin-shadow alias would miscompile (def->lst
  // but calls stay list()->builtin). Must fail loudly, not silently.
  it('rejects a function whose name is a builtin-shadow alias (e.g. `list`)', () => {
    const r = transpileEmlToPython('def list(n):\n    return n\n\nlist(7) => z\nz^0\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.find((d) => d.code === 'E_ALIAS_COLLISION')).toBeDefined();
  });

  // B: interprocedural purity — a @cold fn calling an impure user fn must NOT be
  // reported pure / cached without a warning.
  it('flags a @cold function that calls an impure user function (transitive)', () => {
    const r = transpileEmlToPython(
      'def helper(x):\n    input() => u\n    return x\n\n@cold\ndef compute(n):\n    helper(n) => r\n    return r\n',
    );
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
    const compute = r.metadata.functions.find((f) => f.name === 'compute')!;
    expect(compute.pure).toBe(false);
  });

  it('propagates impurity transitively through a call chain', () => {
    const r = transpileEmlToPython(
      'def leaf(x):\n    input() => u\n    return x\n\ndef mid(x):\n    leaf(x) => r\n    return r\n\n@cold\ndef top(n):\n    mid(n) => r\n    return r\n',
    );
    expect(r.metadata.functions.find((f) => f.name === 'top')!.pure).toBe(false);
    expect(r.diagnostics.filter((d) => d.code === 'W_COLD_SIDE_EFFECT')).toHaveLength(1);
  });

  // B2: non-determinism builtins (time/random) are side effects.
  it('flags a @cold function using a non-deterministic builtin (time)', () => {
    const r = transpileEmlToPython('@cold\ndef stamp(n):\n    time() => r\n    return r\n');
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
  });

  // B3: @cold calling @hot is unsound to cache.
  it('flags a @cold function that calls a @hot function', () => {
    const r = transpileEmlToPython(
      '@hot\ndef now():\n    time() => t\n    return t\n\n@cold\ndef f(n):\n    now() => r\n    return r\n',
    );
    const f = r.metadata.functions.find((fn) => fn.name === 'f')!;
    expect(f.pure).toBe(false);
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
  });

  // B (no false positive): a user function shadows a builtin name; if it is pure,
  // calling it from @cold must NOT warn.
  it('does not warn when a @cold function calls a PURE user function shadowing a builtin name', () => {
    const r = transpileEmlToPython(
      '@cold\ndef choice(x):\n    return x\n\n@cold\ndef pick(n):\n    choice(n) => r\n    return r\n',
    );
    expect(r.ok).toBe(true);
    expect(r.diagnostics.filter((d) => d.code === 'W_COLD_SIDE_EFFECT')).toHaveLength(0);
    expect(r.metadata.functions.every((f) => f.pure)).toBe(true);
  });

  // C: importance dependencyDepth must be deterministic, independent of def order.
  it('computes deterministic, order-independent depth for a recursion cycle', () => {
    const ab = transpileEmlToPython(
      '@cold\ndef a(w):\n    b(w) => p\n    return p\n@cold\ndef b(y):\n    a(y) => z\n    return z\n',
    ).metadata.functions;
    const ba = transpileEmlToPython(
      '@cold\ndef b(y):\n    a(y) => z\n    return z\n@cold\ndef a(w):\n    b(w) => p\n    return p\n',
    ).metadata.functions;
    const depth = (fns: typeof ab, name: string) =>
      fns.find((f) => f.name === name)!.importance.dependencyDepth;
    // Same function gets the same depth regardless of which def came first.
    expect(depth(ab, 'a')).toBe(depth(ba, 'a'));
    expect(depth(ab, 'b')).toBe(depth(ba, 'b'));
    expect(depth(ab, 'a')).toBe(depth(ab, 'b')); // symmetric nodes -> equal
  });

  // #13: duplicate function names should warn, not silently collapse metadata.
  it('warns on a duplicate function name', () => {
    const r = transpileEmlToPython('def f(x):\n    return x\n\ndef f(y):\n    return y\n');
    expect(r.diagnostics.find((d) => d.code === 'W_FN_REDECLARED')).toBeDefined();
  });

  // #14: a parameter shadowing a top-level function name must not inflate that
  // function's call frequency.
  it('does not count a call shadowed by a parameter toward the function', () => {
    const r = transpileEmlToPython('def g(x):\n    return x\n\ndef user(g):\n    g(1) => r\n    return r\n');
    const g = r.metadata.functions.find((f) => f.name === 'g')!;
    expect(g.importance.callFrequency).toBe(0); // the call resolves to the param, not g
  });
});

describe('Phase 2 — CTS function metadata', () => {
  it('emits a functions section with full analysis', () => {
    const r = transpileEmlToPython(COLD);
    const semantic = analyzeSemantics(parse(COLD));
    const cts = generateCts({
      fileName: 'sq.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    expect(cts.functions).toHaveLength(1);
    const fn = cts.functions[0];
    expect(fn.name).toBe('square_sum');
    expect(fn.temperature).toBe('cold');
    expect(fn.pure).toBe(true);
    expect(typeof fn.astHash).toBe('string');
    expect(typeof fn.importance.score).toBe('number');
    // the def node carries the cold semantic type
    expect(cts.nodes.some((n) => n.semanticType === 'function.cold')).toBe(true);
  });
});
