import { describe, it, expect } from 'vitest';
import { interpret } from '@eml/interp';

/**
 * Axis 10 — what the trace records.
 *
 * Every other axis in this repo checks something the compiler PRODUCES: Python
 * text, diagnostics, cache keys. This one checks the RECORD of what happened.
 *
 * That record is load-bearing in a way nothing else here is. The committed
 * `.trace.jsonl` goldens, the `eml:equiv` execution check, the workbench trace
 * panel and every claim in the corpus READMEs are all downstream of it. A
 * trace that silently under-records is the worst possible failure, because a
 * golden that is missing events still matches itself — the check passes
 * forever and the thing it was checking stopped being observed.
 *
 * Two properties, both with a computed oracle:
 *
 *   1. RECONSTRUCTION - the program's stdout, rebuilt from `eml:output`
 *      events alone, must equal the stdout the interpreter actually produced.
 *      Both sides come out of the same run, neither is typed by hand.
 *
 *   2. VISIBILITY - adding a construct to a program must CHANGE the event
 *      multiset. A construct that executes and leaves the trace identical is
 *      invisible to every consumer of it. This is the direction that can
 *      actually fail, and it is checked by diffing two runs rather than by
 *      asserting which events a construct "should" emit — an assertion I
 *      would have to get right, which this repo has learned not to trust.
 */

/** Every event type, with its count, for one program. */
function eventCensus(src: string): Map<string, number> {
  const r = interpret(src, { maxSteps: 200_000 });
  const census = new Map<string, number>();
  for (const e of r.events) {
    const t = String(e.type);
    census.set(t, (census.get(t) ?? 0) + 1);
  }
  return census;
}

function censusKey(c: Map<string, number>): string {
  return [...c.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join(',');
}

/**
 * Programs that differ by exactly one construct. `base` and `with` must run to
 * completion and produce a DIFFERENT trace, or the construct is invisible.
 */
const VISIBILITY: Array<{ construct: string; base: string; withIt: string }> = [
  {
    construct: 'assignment',
    base: '1^0\n',
    withIt: '1 => x\n1^0\n',
  },
  {
    construct: 'augmented assignment',
    base: '1 => x\nx^0\n',
    withIt: '1 => x\nx^+1\nx^0\n',
  },
  {
    construct: 'output',
    base: '1 => x\n',
    withIt: '1 => x\nx^0\n',
  },
  {
    construct: 'function definition',
    base: '1^0\n',
    withIt: 'def f(a):\n    return a\n1^0\n',
  },
  {
    construct: 'function call',
    base: 'def f(a):\n    return a\n1^0\n',
    withIt: 'def f(a):\n    return a\nf(1)^0\n',
  },
  {
    construct: 'if taken',
    base: '1 => x\nx^0\n',
    withIt: '1 => x\nif x > 0:\n    2 => x\nx^0\n',
  },
  {
    construct: 'while loop',
    base: '0 => i\ni^0\n',
    withIt: '0 => i\nwhile i < 3:\n    i + 1 => i\ni^0\n',
  },
  {
    construct: 'for loop',
    base: '0 => s\ns^0\n',
    withIt: '0 => s\nfor i in [1:3]:\n    s + i => s\ns^0\n',
  },
  {
    construct: 'try/except with a raise',
    base: '0 => x\nx^0\n',
    withIt: '0 => x\ntry:\n    raise ValueError("e")\nexcept ValueError as e:\n    1 => x\nx^0\n',
  },
  {
    construct: 'class definition',
    base: '1^0\n',
    withIt: 'class C:\n    1 => v\n1^0\n',
  },
  {
    construct: 'sigma',
    base: '0 => r\nr^0\n',
    withIt: 'Σ(i, i in [1:3]) => r\nr^0\n',
  },
  {
    construct: 'with statement',
    base: '1 => x\nx^0\n',
    withIt: 'class M:\n    def __enter__(self):\n        return 1\n    def __exit__(self, a, b, c):\n        return False\n1 => x\nwith M() as m:\n    m => x\nx^0\n',
  },
  {
    construct: 'subscript write',
    base: '[1, 2] => xs\nstr(xs)^0\n',
    withIt: '[1, 2] => xs\n9 => xs[0]\nstr(xs)^0\n',
  },
  {
    construct: 'list comprehension',
    base: '[] => xs\nstr(xs)^0\n',
    withIt: '[i for i in [1:3]] => xs\nstr(xs)^0\n',
  },
  {
    construct: 'a second call to the same function',
    base: 'def f(a):\n    return a\nf(1)^0\n',
    withIt: 'def f(a):\n    return a\nf(1)^0\nf(2)^0\n',
  },
];

describe('axis 10 — trace completeness', () => {
  it('every visibility program runs to completion, so the traces being compared are real', () => {
    const broken: string[] = [];
    for (const v of VISIBILITY) {
      for (const [label, src] of [['base', v.base], ['with', v.withIt]] as const) {
        const r = interpret(src, { maxSteps: 200_000 });
        if (!r.ok) broken.push(`${v.construct}/${label}: ${r.error?.type ?? 'incomplete'} ${r.error?.message ?? r.unsupported.join(',')}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('adding a construct always changes the trace — nothing executes invisibly', () => {
    const invisible: string[] = [];
    for (const v of VISIBILITY) {
      const a = censusKey(eventCensus(v.base));
      const b = censusKey(eventCensus(v.withIt));
      if (a === b) invisible.push(`${v.construct} (both traces: ${a})`);
    }
    expect(invisible).toEqual([]);
  });

  it('the census actually varies, so the comparison above is not comparing constants', () => {
    // The gate on the gate: if every program produced the same census, the
    // check above would pass while proving nothing.
    const distinct = new Set(VISIBILITY.map((v) => censusKey(eventCensus(v.withIt))));
    expect(distinct.size).toBeGreaterThan(8);
  });
});

describe('the trace must be able to rebuild what the program printed', () => {
  /** Programs chosen to exercise every shape of output the language has. */
  const PROGRAMS: Array<[string, string]> = [
    ['bare literal', '"hello"^0\n'],
    ['numeric', '42^0\n'],
    ['expression', '(1 + 2 * 3)^0\n'],
    ['empty line', '""^0\n'],
    ['end= suppression', '"a"^0("")\n"b"^0\n'],
    ['multi-line loop', 'for i in [1:5]:\n    str(i)^0\n'],
    ['inside a function', 'def f(a):\n    str(a)^0\n    return a\nf(1)\nf(2)\n'],
    ['percent formatting', '("%-4s|%d" % ("x", 7))^0\n'],
    ['unicode', '"π ≈ 3.14"^0\n'],
    ['after an exception is caught', 'try:\n    raise ValueError("v")\nexcept ValueError as e:\n    str(e)^0\n'],
    ['interleaved with assignment', '1 => a\nstr(a)^0\na + 1 => a\nstr(a)^0\n'],
    ['no output at all', '1 => x\n'],
  ];

  it('stdout rebuilt from eml:output events equals the stdout that was produced', () => {
    const mismatches: string[] = [];
    for (const [label, src] of PROGRAMS) {
      const r = interpret(src, { maxSteps: 200_000 });
      if (!r.ok) {
        mismatches.push(`${label}: did not run`);
        continue;
      }
      // Rebuild from the trace alone. `text` is the rendered value; `end` is
      // whatever followed it (default a newline).
      let rebuilt = '';
      for (const e of r.events) {
        if (e.type !== 'eml:output') continue;
        rebuilt += String(e.text ?? '') + String(e.end ?? '\n');
      }
      if (rebuilt !== r.output) {
        mismatches.push(`${label}: trace rebuilt ${JSON.stringify(rebuilt)} but output was ${JSON.stringify(r.output)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('at least one program in the set actually prints something', () => {
    // Without this, an emitter that dropped EVERY output event would rebuild
    // "" from "" and the check above would be vacuous for all of them.
    const printed = PROGRAMS.filter(([, src]) => interpret(src).output.length > 0);
    expect(printed.length).toBeGreaterThan(8);
  });
});

describe('rules the trace sweep pinned down', () => {
  const census = (src: string) => eventCensus(src);

  it('a run that completes is bracketed by run:start and run:done', () => {
    const c = census('1^0\n');
    expect(c.get('eml:run:start')).toBe(1);
    expect(c.get('eml:run:done')).toBe(1);
  });

  it('a run that faults reports run:error and NOT run:done', () => {
    const c = census('raise ValueError("boom")\n');
    expect(c.get('eml:run:error')).toBe(1);
    expect(c.get('eml:run:done')).toBeUndefined();
  });

  it('a caught exception is not a run error — the program completed', () => {
    const c = census('try:\n    raise ValueError("v")\nexcept ValueError as e:\n    1 => x\n');
    expect(c.get('eml:run:error')).toBeUndefined();
    expect(c.get('eml:run:done')).toBe(1);
  });

  it('every loop iteration is recorded, not just the loop', () => {
    // The count must scale with the work. A trace that records "a loop ran"
    // once cannot answer any question about what happened inside it.
    const three = census('0 => s\nfor i in [1:3]:\n    s + i => s\n').get('eml:assign') ?? 0;
    const six = census('0 => s\nfor i in [1:6]:\n    s + i => s\n').get('eml:assign') ?? 0;
    expect(six).toBeGreaterThan(three);
  });

  it('each call is its own event, so recursion depth is recoverable', () => {
    const c = census('def f(n):\n    if n <= 0:\n        return 0\n    return f(n - 1)\nf(4)^0\n');
    expect(c.get('eml:call')).toBe(5); // f(4) plus four recursive calls
    expect(c.get('eml:return')).toBe(5);
  });

  it('a deferred construct is announced rather than silently skipped', () => {
    // The honest-refusal path. `.pop()` on a built-in dict is not implemented
    // in the interpreter; it must say so rather than pretend it ran.
    const r = interpret('{"a": 1} => d\nd.pop("a")\n');
    expect(r.unsupported.length).toBeGreaterThan(0);
    const c = eventCensus('{"a": 1} => d\nd.pop("a")\n');
    expect(c.get('eml:unsupported')).toBe(1);
    expect(c.get('eml:run:incomplete')).toBe(1);
    expect(c.get('eml:run:done')).toBeUndefined();
  });
});
