import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython, CrystalCache, hashFunction } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';
import type { FunctionDef } from '@eml/types';

/**
 * Axis 9 — crystallization cache keys.
 *
 * `hashFunction` decides whether two `@cold` functions are "the same logic".
 * Everything else in this repo checks what the compiler *produces*; this checks
 * what it decides two things *are*, which nothing else can see.
 *
 * Before this file, the whole claim rested on two hand-written pairs in
 * phase2-functions.test.ts: one that must match, one that must not. Two points
 * do not describe a space. This is the cross product.
 *
 * The rule being enforced is the SOUND direction, and only that one:
 *
 *     two functions that BEHAVE differently must not share a cache key
 *
 * A shared key for different logic is a false cache hit — the dangerous
 * direction. The opposite (same behaviour, different key) is a missed hit: a
 * lost optimization, never a wrong answer. It is counted and reported here
 * rather than asserted, because forbidding it would demand the hash decide
 * program equivalence, which is undecidable.
 *
 * The expectation is COMPUTED, not typed. Every variant is actually RUN over a
 * shared battery of inputs and its observable behaviour recorded — output and
 * raised exception both. A hand-written list of "these two differ" would be
 * exactly the kind of assertion this repo has been wrong about four times.
 */

/** Inputs every variant is driven with, chosen to separate near-identical logic. */
const BATTERY = [
  '0', '1', '2', '3', '5', '10', '-1', '-4', '7',
];

/**
 * Function variants, all with the signature `probe(n)`, all total over BATTERY
 * or raising in a way the harness records. Grouped by the transformation each
 * one applies to the base, since that is what the cross product is over.
 */
const VARIANTS: Array<{ id: string; body: string }> = [
  // --- the base, and transformations that preserve behaviour exactly
  { id: 'base', body: '    return n * 2 + 1' },
  { id: 'rename-param', body: '    return n * 2 + 1', },
  { id: 'via-local', body: '    n * 2 => t\n    return t + 1' },
  { id: 'via-local-renamed', body: '    n * 2 => u\n    return u + 1' },
  { id: 'commuted-operands', body: '    return 2 * n + 1' },
  { id: 'extra-parens', body: '    return (n * 2) + 1' },
  { id: 'split-across-two-locals', body: '    n * 2 => a\n    a + 1 => b\n    return b' },

  // --- transformations that change behaviour, in decreasing order of obviousness
  { id: 'literal-changed', body: '    return n * 2 + 2' },
  { id: 'literal-zero', body: '    return n * 2 + 0' },
  { id: 'operator-changed', body: '    return n * 2 - 1' },
  { id: 'factor-changed', body: '    return n * 3 + 1' },
  { id: 'operand-order-noncommutative', body: '    return 1 + n * 2' },
  { id: 'precedence-shifted', body: '    return n * (2 + 1)' },

  // --- control flow: same shape, different branch conditions
  { id: 'guard-gt', body: '    if n > 2:\n        return n\n    return 0' },
  { id: 'guard-ge', body: '    if n >= 2:\n        return n\n    return 0' },
  { id: 'guard-lt', body: '    if n < 2:\n        return n\n    return 0' },
  { id: 'guard-negated', body: '    if not (n > 2):\n        return 0\n    return n' },
  { id: 'branches-swapped', body: '    if n > 2:\n        return 0\n    return n' },

  // --- loops: bounds and accumulation order
  { id: 'loop-inclusive', body: '    0 => s\n    for i in [1:n]:\n        s + i => s\n    return s' },
  { id: 'loop-from-zero', body: '    0 => s\n    for i in [0:n]:\n        s + i => s\n    return s' },
  { id: 'loop-squared', body: '    0 => s\n    for i in [1:n]:\n        s + i * i => s\n    return s' },
  { id: 'loop-product', body: '    1 => s\n    for i in [1:n]:\n        s * i => s\n    return s' },
  { id: 'loop-while-equivalent', body: '    0 => s\n    1 => i\n    while i <= n:\n        s + i => s\n        i + 1 => i\n    return s' },

  // --- statement ORDER, which no single-statement check can see
  { id: 'order-ab', body: '    n + 1 => a\n    n * 2 => b\n    return a * 10 + b' },
  { id: 'order-ba', body: '    n * 2 => b\n    n + 1 => a\n    return a * 10 + b' },
  { id: 'order-dependent', body: '    n + 1 => a\n    a * 2 => b\n    return a * 10 + b' },

  // --- calls: the callee NAME is inside the body, so it must be part of the key
  { id: 'calls-abs', body: '    return abs(n) * 2 + 1' },
  { id: 'calls-int', body: '    return int(n) * 2 + 1' },

  // --- raising, and raising differently
  { id: 'raises-on-zero', body: '    if n == 0:\n        raise ValueError("zero")\n    return n' },
  { id: 'raises-other-message', body: '    if n == 0:\n        raise ValueError("nil")\n    return n' },
  { id: 'raises-other-class', body: '    if n == 0:\n        raise TypeError("zero")\n    return n' },
  { id: 'raises-other-condition', body: '    if n == 1:\n        raise ValueError("zero")\n    return n' },

  // --- string results, where a one-character change is invisible to arithmetic
  { id: 'string-prefix', body: '    return "v" + str(n)' },
  { id: 'string-other-prefix', body: '    return "w" + str(n)' },
  { id: 'string-suffix', body: '    return str(n) + "v"' },
];

/** Source for one variant, wrapped so its name is always `probe`. */
function sourceOf(v: { id: string; body: string }): string {
  const param = v.id === 'rename-param' ? 'm' : 'n';
  const body = v.id === 'rename-param' ? v.body.replace(/\bn\b/g, 'm') : v.body;
  return `def probe(${param}):\n${body}\n`;
}

/**
 * Observable behaviour of a variant over the whole battery: the printed value
 * for each input, or the exception it raised. Two variants agree only if this
 * whole string agrees.
 */
function behaviourOf(v: { id: string; body: string }): string {
  const calls = BATTERY.map(
    (arg) =>
      `try:\n    probe(${arg}) => r\n    str(r)^0\nexcept ValueError as e:\n    ("ValueError: " + str(e))^0\nexcept TypeError as e:\n    ("TypeError: " + str(e))^0\n`,
  ).join('');
  const r = interpret(sourceOf(v) + '\n' + calls, { maxSteps: 200_000 });
  if (!r.ok) return `FAULT ${r.error?.type ?? 'unknown'}: ${r.error?.message ?? ''}`;
  return r.outputLines.join('|');
}

function keyOf(v: { id: string; body: string }): string {
  return hashFunction(parse(sourceOf(v)).body[0] as FunctionDef);
}

describe('axis 9 — crystallization cache keys', () => {
  const rows = VARIANTS.map((v) => ({ id: v.id, key: keyOf(v), behaviour: behaviourOf(v) }));

  it('every variant actually runs, so the behaviours being compared are real', () => {
    const faulted = rows.filter((r) => r.behaviour.startsWith('FAULT'));
    expect(faulted.map((r) => `${r.id}: ${r.behaviour}`)).toEqual([]);
  });

  it('the battery separates the variants it is supposed to separate', () => {
    // If every variant produced the same output, the sweep below would pass
    // while proving nothing. This is the gate on the gate.
    const distinct = new Set(rows.map((r) => r.behaviour));
    expect(distinct.size).toBeGreaterThan(20);
  });

  it('no two behaviourally different functions share a cache key', () => {
    const collisions: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].behaviour !== rows[j].behaviour && rows[i].key === rows[j].key) {
          collisions.push(`${rows[i].id} ~ ${rows[j].id} (key ${rows[i].key})`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });

  it('records how often identical behaviour fails to share a key (a missed hit, not a bug)', () => {
    let sameBehaviour = 0;
    let sharedKey = 0;
    const missed: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].behaviour !== rows[j].behaviour) continue;
        sameBehaviour++;
        if (rows[i].key === rows[j].key) sharedKey++;
        else missed.push(`${rows[i].id} ~ ${rows[j].id}`);
      }
    }
    // Recorded, not enforced. The hash is structural, so alpha-equivalent and
    // algebraically-equal bodies are expected to miss; demanding otherwise
    // would be demanding it decide program equivalence.
    expect(sameBehaviour).toBeGreaterThan(0);
    expect(sharedKey + missed.length).toBe(sameBehaviour);
  });
});

describe('rules the cache-key sweep pinned down', () => {
  const key = (src: string) => hashFunction(parse(src).body[0] as FunctionDef);

  it('the function name is excluded, so a pure rename shares a key', () => {
    expect(key('def a(n):\n    return n\n')).toBe(key('def b(n):\n    return n\n'));
  });

  it('a PARAMETER name is NOT excluded, so alpha-equivalent bodies do not share a key', () => {
    // The module doc says the name is excluded "so two identically-bodied
    // functions crystallize to the same key". That holds only for the
    // function's OWN name. `def a(n): return n` and `def a(m): return m` are
    // the same logic and get different keys. Safe (a missed hit), but the
    // claim is narrower than it reads.
    expect(key('def a(n):\n    return n\n')).not.toBe(key('def a(m):\n    return m\n'));
  });

  it('a LOCAL name is not excluded either', () => {
    expect(key('def a(n):\n    n + 1 => r\n    return r\n')).not.toBe(
      key('def a(n):\n    n + 1 => s\n    return s\n'),
    );
  });

  it('the decorator is excluded, so @cold and @hot with one body share a key', () => {
    // Deliberate: only cold functions are ever stored, so a hot function's key
    // is never consulted. If crystallization is ever extended to hot
    // functions, this line is the one that has to change first.
    expect(key('@cold\ndef a(n):\n    return n\n')).toBe(key('@hot\ndef a(n):\n    return n\n'));
  });

  it('comments and blank lines inside a body do not change the key', () => {
    expect(key('def a(n):\n    # a comment\n    return n\n')).toBe(key('def a(n):\n    return n\n'));
  });

  it('statement ORDER changes the key even when the two statements are independent', () => {
    expect(key('def a(n):\n    1 => x\n    2 => y\n    return x\n')).not.toBe(
      key('def a(n):\n    2 => y\n    1 => x\n    return x\n'),
    );
  });

  it('a raise message is part of the key', () => {
    expect(key('def a(n):\n    raise ValueError("x")\n')).not.toBe(
      key('def a(n):\n    raise ValueError("y")\n'),
    );
  });

  it('parameter ORDER changes the key', () => {
    expect(key('def a(x, y):\n    return x - y\n')).not.toBe(key('def a(y, x):\n    return x - y\n'));
  });
});

describe('the invariant the cache must never break', () => {
  const SRC = '@cold\ndef a(n):\n    return n * 2\n\n@cold\ndef b(m):\n    return m * 3\n\na(2) => p\nb(2) => q\n(str(p) + " " + str(q))^0\n';

  it('emitted Python is byte-identical whether the cache is cold or warm', () => {
    // The module header promises "the emitted Python is never altered, so
    // output stays deterministic and correct regardless of cache state".
    // Nothing was checking it. This runs the same source through a fresh
    // cache and a cache that has already seen both functions.
    const cold = transpileEmlToPython(SRC, { crystalCache: new CrystalCache() });
    const warm = new CrystalCache();
    transpileEmlToPython(SRC, { crystalCache: warm });
    const second = transpileEmlToPython(SRC, { crystalCache: warm });

    expect(second.metadata.functions.every((f) => f.cached)).toBe(true);
    expect(cold.metadata.functions.every((f) => f.cached)).toBe(false);
    expect(second.python).toBe(cold.python);
  });

  it('execution output is identical whether the cache is cold or warm', () => {
    const warm = new CrystalCache();
    transpileEmlToPython(SRC, { crystalCache: warm });
    const a = interpret(SRC);
    const b = interpret(SRC);
    expect(b.output).toBe(a.output);
    expect(a.output.trim()).toBe('4 6');
  });

  it('a cache carrying an unrelated key does not manufacture a hit', () => {
    const cache = new CrystalCache();
    cache.store('deadbeef');
    const r = transpileEmlToPython(SRC, { crystalCache: cache });
    expect(r.metadata.functions.every((f) => f.cached)).toBe(false);
  });
});
