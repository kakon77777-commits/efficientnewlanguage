import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { interpret } from '@eml/interp';
import type { Cts } from '@eml/types';

/**
 * Axis 11 — is the CTS a description of the program that was compiled?
 *
 * The CTS is the compiler's account of a program: which names a node depends
 * on, how often a function is called, how deep the call graph goes, whether a
 * function is pure, whether a loop terminates. `eml explain`, the workbench
 * panel and any agent reading EML output all take it at face value.
 *
 * Nothing forces it to be true. It is generated alongside the Python rather
 * than derived from it, so a claim can drift from the program and stay
 * perfectly self-consistent — the same failure shape as an under-recording
 * trace (axis 10), one level up. A description that is wrong is not caught by
 * comparing the description to itself.
 *
 * So every claim here is graded by a route that does not read the CTS:
 *
 *   callFrequency     against programs whose call count is varied on purpose
 *   dependencyDepth   against a call chain of known length
 *   pure              against EXECUTION - a function claimed pure that
 *                     produces output when called is a false claim, and the
 *                     interpreter settles it
 *   stability         reformatting must not change the account; changing the
 *                     program must
 *
 * The purity check is the one worth the file. Everything else compares a
 * number to a number I chose; purity compares a claim to what the program
 * actually did.
 */

function ctsOf(src: string): Cts {
  const result = transpileEmlToPython(src, { fileName: 't.eml' });
  const semantic = analyzeSemantics(parse(src));
  return generateCts({
    fileName: 't.eml',
    normalized: result.normalized,
    program: semantic.program,
    symbolsUsed: semantic.symbolsUsed,
    functions: result.metadata.functions,
    loops: result.metadata.loops,
  });
}

function fn(cts: Cts, name: string) {
  return cts.functions.find((f) => f.name === name);
}

describe('axis 11 — callFrequency counts real call sites', () => {
  /** Same function, called a different number of times. */
  const program = (calls: number) => {
    let body = 'def leaf(n):\n    return n + 1\n\n0 => t\n';
    for (let i = 0; i < calls; i++) body += `t + leaf(${i}) => t\n`;
    body += 't^0\n';
    return body;
  };

  it('tracks the number of call sites, not a constant', () => {
    const seen: Array<[number, number]> = [];
    for (const n of [1, 2, 3, 5, 8]) {
      const f = fn(ctsOf(program(n)), 'leaf');
      seen.push([n, f?.importance.callFrequency ?? -1]);
    }
    // The claim is a COUNT. If it were hardcoded, or derived from something
    // other than call sites, this list would not track the left column.
    expect(seen).toEqual([[1, 1], [2, 2], [3, 3], [5, 5], [8, 8]]);
  });

  it('a defined but never called function has frequency 0', () => {
    const f = fn(ctsOf('def unused(n):\n    return n\n1^0\n'), 'unused');
    expect(f?.importance.callFrequency).toBe(0);
  });

  it('calls from inside another function are counted too', () => {
    const src =
      'def leaf(n):\n    return n\n\ndef mid(n):\n    return leaf(n) + leaf(n)\n\nmid(1)^0\n';
    expect(fn(ctsOf(src), 'leaf')?.importance.callFrequency).toBe(2);
  });
});

describe('axis 11 — dependencyDepth matches the real call graph', () => {
  /** A chain of `depth` functions, each calling the next. */
  const chain = (depth: number) => {
    let src = 'def f1(n):\n    return n + 1\n\n';
    for (let i = 2; i <= depth; i++) {
      src += `def f${i}(n):\n    return f${i - 1}(n)\n\n`;
    }
    src += `f${depth}(1)^0\n`;
    return src;
  };

  it('a leaf is 1 and each layer adds one', () => {
    const seen: Array<[number, number]> = [];
    for (const d of [1, 2, 3, 4]) {
      const cts = ctsOf(chain(d));
      seen.push([d, fn(cts, `f${d}`)?.importance.dependencyDepth ?? -1]);
    }
    expect(seen).toEqual([[1, 1], [2, 2], [3, 3], [4, 4]]);
  });

  it('within one program, a deeper function reports a greater depth', () => {
    const cts = ctsOf(chain(4));
    const d1 = fn(cts, 'f1')?.importance.dependencyDepth ?? 0;
    const d4 = fn(cts, 'f4')?.importance.dependencyDepth ?? 0;
    expect(d4).toBeGreaterThan(d1);
  });
});

describe('axis 11 — `pure` is settled by running the function', () => {
  /**
   * Call the function and report whether the program printed anything. This is
   * the oracle: purity is a claim about side effects, and output is a side
   * effect the interpreter can see.
   */
  function producesOutput(defSrc: string, call: string): boolean {
    const r = interpret(`${defSrc}\n${call}\n`, { maxSteps: 50_000 });
    if (!r.ok) return false;
    return r.output.length > 0;
  }

  const CASES: Array<{ name: string; def: string; call: string }> = [
    { name: 'silent', def: 'def silent(n):\n    return n * 2\n', call: 'silent(3) => v\n' },
    { name: 'prints', def: 'def prints(n):\n    str(n)^0\n    return n\n', call: 'prints(3) => v\n' },
    {
      name: 'calls_a_printer',
      def: 'def inner(n):\n    str(n)^0\n    return n\n\ndef calls_a_printer(n):\n    return inner(n)\n',
      call: 'calls_a_printer(3) => v\n',
    },
    {
      name: 'loops_silently',
      def: 'def loops_silently(n):\n    0 => s\n    for i in [1:n]:\n        s + i => s\n    return s\n',
      call: 'loops_silently(3) => v\n',
    },
  ];

  it('no function claimed pure produces output when called', () => {
    const liars: string[] = [];
    for (const c of CASES) {
      const claimed = fn(ctsOf(`${c.def}\n${c.call}`), c.name)?.pure;
      const observed = producesOutput(c.def, c.call);
      if (claimed === true && observed) liars.push(`${c.name}: claimed pure, printed`);
    }
    expect(liars).toEqual([]);
  });

  it('the observation actually separates the cases, so the check is not vacuous', () => {
    // If nothing printed, the check above would pass for a generator that
    // claimed everything pure.
    const printed = CASES.filter((c) => producesOutput(c.def, c.call));
    expect(printed.map((c) => c.name).sort()).toEqual(['calls_a_printer', 'prints']);
  });

  it('a silent function is claimed pure, so `pure` is not simply always false', () => {
    expect(fn(ctsOf(`${CASES[0].def}\n${CASES[0].call}`), 'silent')?.pure).toBe(true);
    expect(fn(ctsOf(`${CASES[3].def}\n${CASES[3].call}`), 'loops_silently')?.pure).toBe(true);
  });

  it('an impure function carries a stated reason, not just a flag', () => {
    const f = fn(ctsOf(`${CASES[1].def}\n${CASES[1].call}`), 'prints');
    expect(f?.pure).toBe(false);
    expect((f?.sideEffects ?? []).length).toBeGreaterThan(0);
  });
});

describe('axis 11 — the account tracks the program, not the formatting', () => {
  const BASE = 'def leaf(n):\n    return n + 1\n\nleaf(1) => a\na^0\n';

  /** Everything about the CTS that is a claim about the program. */
  function semanticShape(src: string): string {
    const c = ctsOf(src);
    return JSON.stringify({
      nodes: c.nodes.map((n) => [n.semanticType, [...n.dependencies].sort()]),
      functions: c.functions.map((f) => [
        f.name,
        f.temperature,
        f.pure,
        f.importance.callFrequency,
        f.importance.dependencyDepth,
      ]),
      loops: (c.loops ?? []).map((l) => [l.loopKind, l.deterministic, l.terminating]),
    });
  }

  it('comments and blank lines do not change the account', () => {
    const commented = 'def leaf(n):\n    # a comment\n    return n + 1\n\n\nleaf(1) => a\na^0\n';
    expect(semanticShape(commented)).toBe(semanticShape(BASE));
  });

  it('adding a call DOES change the account', () => {
    const more = 'def leaf(n):\n    return n + 1\n\nleaf(1) => a\nleaf(2) => b\na^0\n';
    expect(semanticShape(more)).not.toBe(semanticShape(BASE));
  });

  it('changing what a function computes changes the account', () => {
    // The astHash is excluded from `semanticShape` on purpose - it would make
    // this pass for the wrong reason. What has to move is a described
    // property, and here it is the node's own source/dependency structure.
    const different = 'def leaf(n):\n    str(n)^0\n    return n + 1\n\nleaf(1) => a\na^0\n';
    expect(semanticShape(different)).not.toBe(semanticShape(BASE));
  });

  it('generating twice gives the same account', () => {
    expect(semanticShape(BASE)).toBe(semanticShape(BASE));
  });
});

describe('rules the CTS sweep pinned down', () => {
  it('every node dependency is a name the program actually mentions', () => {
    const src = 'def leaf(n):\n    return n + 1\n\n5 => x\nleaf(x) => y\ny^0\n';
    const cts = ctsOf(src);
    const text = src;
    const bogus: string[] = [];
    for (const n of cts.nodes) {
      for (const d of n.dependencies) {
        if (!text.includes(d)) bogus.push(`${n.id}: ${d}`);
      }
    }
    expect(bogus).toEqual([]);
  });

  it('a node that references a name lists it as a dependency', () => {
    const cts = ctsOf('5 => x\n3 => y\nx + y => z\nz^0\n');
    const zNode = cts.nodes.find((n) => n.source.includes('=> z'));
    expect(zNode).toBeDefined();
    expect([...(zNode?.dependencies ?? [])].sort()).toEqual(['x', 'y']);
  });

  it('a finite for-range is reported terminating and deterministic', () => {
    const cts = ctsOf('0 => s\nfor i in [1:5]:\n    s + i => s\ns^0\n');
    const loops = cts.loops ?? [];
    expect(loops.length).toBeGreaterThan(0);
    expect(loops.every((l) => l.terminating && l.deterministic)).toBe(true);
  });

  it('a statement-only program reports no functions rather than inventing one', () => {
    const cts = ctsOf('1 => x\nx^0\n');
    expect(cts.functions).toEqual([]);
  });
});
