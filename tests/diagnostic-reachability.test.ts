import { describe, it, expect } from 'vitest';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';

/**
 * DIAGNOSTIC REACHABILITY — the eighth measured axis, and the first that is
 * not about what the language DOES.
 *
 * Every axis before this one measured success behaviour: which constructs run,
 * which builtins agree with CPython, which operator pairings, which statement
 * orderings, which values at their boundaries, which nestings round-trip,
 * which slice bounds clamp. All of them ask "when this program runs, is the
 * answer right?"
 *
 * None of them can see the REFUSAL surface. A compiler's diagnostics are a
 * promise: "if you write this mistake, I will tell you". A diagnostic that
 * cannot be triggered is a promise with nothing behind it — and unlike a wrong
 * answer, it produces no symptom at all. The program that should have been
 * rejected simply is not, and everything downstream behaves as though it were
 * correct.
 *
 * So this file enumerates every diagnostic code the compiler defines and, for
 * each, holds a minimal program that must produce it. Three outcomes are
 * possible and all three are recorded rather than skipped:
 *
 *   REACHABLE      a program exists here that triggers it
 *   OUT OF SCOPE   the code belongs to a layer this test does not drive
 *                  (the REST worker, the runtime bug classifier)
 *   UNREACHABLE    nothing here triggers it — either dead, or the trigger is
 *                  not known, and either way that is worth stating
 *
 * The count at the bottom is the gate: if a code is added and no trigger is
 * written for it, the test fails and names it.
 */

/** Every code the compiler currently defines, gathered from the source. */
const ALL_CODES = [
  'E_ALIAS_COLLISION',
  'E_BREAK_OUTSIDE_LOOP',
  'E_CLASS_BODY_UNSUPPORTED',
  'E_CONTINUE_OUTSIDE_LOOP',
  'E_CPP_UNSUPPORTED',
  'E_INTERNAL',
  'E_LEX',
  'E_PARSE',
  'E_PAYLOAD_TOO_LARGE',
  'E_RANGE_NONINT',
  'E_RESOURCE_LIMIT',
  'E_RETURN_OUTSIDE_FN',
  'E_RUNTIME',
  'W_AUG_UNDECLARED',
  'W_CLASS_REDECLARED',
  'W_COLD_ASYNC',
  'W_COLD_SIDE_EFFECT',
  'W_FN_REDECLARED',
  'W_METHOD_DECORATOR_UNSUPPORTED',
  'W_TEMPORAL_ARG',
  'W_TEMPORAL_NOT_ASYNC',
  'W_TEMP_CONFLICT',
  'W_UNKNOWN_DECORATOR',
] as const;

/**
 * A program that must produce the given code. Written as the SMALLEST mistake
 * that provokes it, so the trigger doubles as documentation of what the code
 * actually means.
 */
const TRIGGERS: Record<string, string> = {
  E_LEX: '"unterminated\n',
  E_PARSE: 'if True\n    1 => x\n',
  E_BREAK_OUTSIDE_LOOP: 'break\n',
  E_CONTINUE_OUTSIDE_LOOP: 'continue\n',
  E_RETURN_OUTSIDE_FN: 'return 1\n',
  E_RANGE_NONINT: 'for i in [1.5:3]:\n    str(i)^0\n',
  // `list` is the ONLY entry in IDENTIFIER_ALIASES (it becomes `lst`), so it is
  // the only name that can collide. The first trigger written here used `len`,
  // which is not aliased and produces nothing — the trigger was wrong, not the
  // diagnostic. Reading the alias table settled it in one grep.
  E_ALIAS_COLLISION: 'def list(xs):\n    return 0\nstr(list([1]))^0\n',
  E_CLASS_BODY_UNSUPPORTED: 'class C:\n    for i in [0:1]:\n        pass\n',
  // `^+` on an undeclared name DECLARES it — that is what overlay-assign means.
  // Only `^-`, `^*` and `^/` are unconditionally augmenting, so only they can
  // warn about a target that was never declared.
  W_AUG_UNDECLARED: 'undeclared^-1\n',
  W_FN_REDECLARED: 'def f():\n    return 1\ndef f():\n    return 2\nstr(f())^0\n',
  W_CLASS_REDECLARED: 'class C:\n    def m(self):\n        return 1\nclass C:\n    def m(self):\n        return 2\n',
  W_COLD_SIDE_EFFECT: '@cold\ndef f(n):\n    "side effect"^0\n    return n\nstr(f(1))^0\n',
  W_UNKNOWN_DECORATOR: '@mystery\ndef f():\n    return 1\nstr(f())^0\n',
  W_METHOD_DECORATOR_UNSUPPORTED: 'class C:\n    @cold\n    def m(self):\n        return 1\n',
  W_TEMP_CONFLICT: '@cold\n@hot\ndef f():\n    return 1\nstr(f())^0\n',
  W_COLD_ASYNC: '@cold\nasync def f():\n    return 1\n',
  W_TEMPORAL_NOT_ASYNC: '@temporal_loop(10, 1, "stop")\ndef f():\n    return 1\n',
  // The check is on keyword argument NAMES against
  // {max_wait, check_interval, timeout_action}, not on their values. A bogus
  // value is accepted; a bogus NAME is what warns.
  W_TEMPORAL_ARG: '@temporal_loop(bogus=10)\nasync def f():\n    return 1\n',
};

/** Codes produced by a layer this file does not drive, named rather than hidden. */
const OUT_OF_SCOPE: Record<string, string> = {
  E_PAYLOAD_TOO_LARGE: 'the REST worker rejecting an oversized body — worker/index.ts, covered by npm run test:worker',
  E_RESOURCE_LIMIT: 'the REST worker aborting a runaway program — same place, same suite',
  E_RUNTIME: 'the bug classifier mapping a real Python traceback back to EML — packages/bug-classifier',
  E_INTERNAL:
    'a compiler invariant being violated. By design nothing should reach it; a trigger would be a bug in the compiler, not a test case',
};

/** Codes only the C++ emitter produces, driven separately below. */
const CPP_ONLY = ['E_CPP_UNSUPPORTED'];

function codesFor(src: string): string[] {
  const r = transpileEmlToPython(src);
  return (r.diagnostics ?? []).map((d) => d.code);
}

describe('every diagnostic code is reachable, or explicitly accounted for', () => {
  it('the trigger table covers every code the compiler defines', () => {
    const covered = new Set([...Object.keys(TRIGGERS), ...Object.keys(OUT_OF_SCOPE), ...CPP_ONLY]);
    const uncovered = ALL_CODES.filter((c) => !covered.has(c));
    expect(
      uncovered,
      `${uncovered.length} diagnostic code(s) have no trigger and no stated reason:\n  ${uncovered.join('\n  ')}\n` +
        'Add a trigger program, or record why the code belongs to another layer.',
    ).toEqual([]);
  });

  it('every trigger program actually produces its code', () => {
    const failures: string[] = [];
    for (const [code, src] of Object.entries(TRIGGERS)) {
      const produced = codesFor(src);
      if (!produced.includes(code)) {
        failures.push(`${code}: produced [${produced.join(', ') || 'nothing'}] instead\n      source: ${JSON.stringify(src)}`);
      }
    }
    expect(failures, `${failures.length} diagnostic(s) could not be triggered:\n  ${failures.join('\n  ')}`).toEqual([]);
  });

  it('the C++ emitter refuses what it cannot compile', () => {
    // Straight-line arithmetic is all the prototype handles; every block
    // construct must be refused rather than mis-compiled.
    const refused = ['if True:\n    1 => x\n', 'for i in [0:2]:\n    str(i)^0\n', 'class C:\n    def m(self):\n        return 1\n'];
    for (const src of refused) {
      const r = transpileEmlToCpp(src);
      expect(r.ok, `expected C++ to refuse:\n${src}`).toBe(false);
      expect(JSON.stringify(r.diagnostics)).toContain('E_CPP_UNSUPPORTED');
    }
  });
});

/**
 * The other half of the promise: a diagnostic must not fire on a program that
 * is fine. A checker that warns about everything is as useless as one that
 * warns about nothing, and the second failure mode is the one nobody tests.
 */
describe('diagnostics do not fire on correct programs', () => {
  const CLEAN = [
    ['plain arithmetic', '1 + 2 => x\nstr(x)^0\n'],
    ['a loop with break and continue INSIDE it', 'for i in [0:5]:\n    if i == 1:\n        continue\n    if i == 3:\n        break\n    str(i)^0\n'],
    ['return inside a function', 'def f():\n    return 1\nstr(f())^0\n'],
    ['a declared augmented assignment', '0 => n\nn^+1\nstr(n)^0\n'],
    ['a pure @cold function', '@cold\ndef square(n):\n    return n * n\nstr(square(4))^0\n'],
    ['a class with a method', 'class C:\n    def m(self):\n        return 7\nC() => c\nstr(c.m())^0\n'],
    ['an integer range', 'for i in [0:3]:\n    str(i)^0\n'],
    ['a function named like nothing built in', 'def tally(xs):\n    return len(xs)\nstr(tally([1, 2]))^0\n'],
  ];

  for (const [label, src] of CLEAN) {
    it(`${label} produces no diagnostics at all`, () => {
      const produced = codesFor(src!);
      expect(produced, `unexpected diagnostics on a correct program:\n${src}`).toEqual([]);
    });
  }
});
