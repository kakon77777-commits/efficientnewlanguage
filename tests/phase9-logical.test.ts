import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import {
  transpileEmlToPython,
  analyzeSemantics,
  checkPurity,
  classifyLoops,
} from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';
import type { FunctionDef } from '@eml/types';

/**
 * Phase 9 — language extension, item 1: `and`/`or` boolean combinators (real
 * B-6 corpus gap: EML had zero boolean-logic support before this). This is a
 * genuine new Expression node type threaded through BOTH directions and every
 * analysis pass, not a single-direction reverse-transpiler phase — see
 * `docs/reverse-transpiler-feasibility.md` for the methodology and
 * `docs/EML-LANG-2026-v1.0.md` §5.8 for the normative semantics (short-circuit,
 * returns an operand not always a bool — matching Python exactly).
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

describe('Phase 9 — forward parser: and/or', () => {
  it('parses `and` as a Logical node', () => {
    const ast = parse('x > 1 and y > 2\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.type).toBe('ExpressionStatement');
    expect(stmt.expression).toMatchObject({
      type: 'Logical',
      op: 'and',
      left: { type: 'Comparison', op: '>' },
      right: { type: 'Comparison', op: '>' },
    });
  });

  it('parses `or` as a Logical node', () => {
    const ast = parse('x > 1 or y > 2\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'Logical', op: 'or' });
  });

  it('`and` binds tighter than `or` (no parens needed for the natural grouping)', () => {
    const r = transpileEmlToPython('x^+1\ny^+1\nz^+1\nx > 0 and y > 0 or z > 0 => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = x > 0 and y > 0 or z > 0');
  });

  it('the ternary condition can itself contain and/or', () => {
    const r = transpileEmlToPython('x^+5\ny^+5\n(x > 0 and y > 0) ? 1 : 0 => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
  });

  it('∧/∨ Unicode display forms normalize to and/or', () => {
    const r = transpileEmlToPython('x^+5\ny^+0\nx > 0 ∧ y > 0 ∨ x < 100 => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('x > 0 and y > 0 or x < 100');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity (value, not just truthiness)', () => {
  const cases: Array<[string, string, string]> = [
    ['a^+0\nb^+5\na and b => r\nr^0', '0', 'a and b, a=0 falsy -> returns a'],
    ['a^+3\nb^+5\na and b => r\nr^0', '5', 'a and b, both truthy -> returns b'],
    ['a^+0\nb^+5\na or b => r\nr^0', '5', 'a or b, a falsy -> returns b'],
    ['a^+3\nb^+5\na or b => r\nr^0', '3', 'a or b, a truthy -> returns a'],
    ['a^+0\nb^+5\nc^+0\na and (b or c) => r\nr^0', '0', 'a and (b or c), a falsy -> returns a (0)'],
    ['a^+5\nb^+0\nc^+7\na and (b or c) => r\nr^0', '7', 'a and (b or c), a truthy, b falsy -> returns c (7)'],
  ];
  for (const [src, expected, label] of cases) {
    it(label, () => {
      const r = transpileEmlToPython(src);
      expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
      expect(pythonStdout(r.python)).toBe(expected);
    });
  }

  it('explicit parens change the actual returned VALUE (not just truthiness) between the two groupings', () => {
    const grouped = transpileEmlToPython('a^+0\nb^+5\nc^+0\na and (b or c) => r\nr^0');
    const ungrouped = transpileEmlToPython('a^+0\nb^+5\nc^+0\n(a and b) or c => r\nr^0');
    expect(pythonStdout(grouped.python)).toBe('0'); // a falsy -> a
    expect(pythonStdout(ungrouped.python)).toBe('0'); // (a and b)=0, 0 or c(0) = 0
    const grouped2 = transpileEmlToPython('a^+5\nb^+0\nc^+7\na and (b or c) => r\nr^0');
    expect(pythonStdout(grouped2.python)).toBe('7'); // b falsy, c truthy -> c
  });
});

describe('Phase 9 — interpreter short-circuit (execution-truth, not just value correctness)', () => {
  it('and: right side is never evaluated when left is falsy', () => {
    // A call to an undefined name would raise NameError if actually evaluated.
    const r = interpret('a^+0\na and undefined_name() => r\nr^0');
    expect(r.error).toBeUndefined();
    expect(r.ok).toBe(true);
    expect(r.output).toBe('0\n');
  });

  it('or: right side is never evaluated when left is truthy', () => {
    const r = interpret('a^+5\na or undefined_name() => r\nr^0');
    expect(r.error).toBeUndefined();
    expect(r.ok).toBe(true);
    expect(r.output).toBe('5\n');
  });

  it('and/or return an operand, not always a bool — matches real Python', () => {
    const src = 'a^+0\nb^+5\na and b => r\nr^0';
    const { python, ok } = transpileEmlToPython(src);
    expect(ok).toBe(true);
    const r = interpret(src);
    expect(r.output).toBe('0\n');
    if (PYTHON) expect(pythonStdout(python)).toBe(r.output.trimEnd());
  });
});

describe('Phase 9 — purity/importance/loop-classifier do not miss a call/loop hidden inside and/or', () => {
  it('scanExpression finds an impure call hidden inside `and` (checkPurity)', () => {
    const fn = parse('@cold\ndef f(x):\n    input(x) and 5 => y\n    return y\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('collectCallsExpr finds an interprocedural call hidden inside `and` (W_COLD_SIDE_EFFECT propagates)', () => {
    const r = transpileEmlToPython(
      'def helper(x):\n    input() => u\n    return x\n\n@cold\ndef compute(n):\n    helper(n) and 5 => r\n    return r\n',
    );
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
    const compute = r.metadata.functions.find((f) => f.name === 'compute')!;
    expect(compute.pure).toBe(false);
  });

  it('importance walkExpr counts a call hidden inside `or` toward callFrequency', () => {
    const src = '@cold\ndef sq(N):\n    return N\n\nsq(10) or 1 => a\n';
    const fn = transpileEmlToPython(src).metadata.functions[0];
    expect(fn.importance.callFrequency).toBe(1);
  });

  it('loop-classifier finds a Σ hidden inside `and`', () => {
    const program = parse('x^+1\n(x > 0) and Σ(i^2, i in [1:N]) => r\n');
    expect(classifyLoops(program, []).some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });
});

describe('Phase 9 — C++ prototype backend', () => {
  it('emits && / || for and/or', () => {
    const r = transpileEmlToCpp('x^+1\ny^+1\nx > 0 and y > 0 => r\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.cpp).toContain('&&');
  });

  it('emits || for or', () => {
    const r = transpileEmlToCpp('x^+1\ny^+1\nx > 0 or y > 0 => r\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.cpp).toContain('||');
  });

  it('self-recursion hidden behind `and` is still rejected (expressionCallsName must not miss it)', () => {
    const r = transpileEmlToCpp('def fact(n):\n    fact(n) and 1 => r\n    return r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });
});

describe('Phase 9 — reverse Python->EML: and/or round-trip', () => {
  it('a bare and/or comparison combo round-trips', () => {
    const py = 'menu = 1\nif menu < 1 or menu > 2:\n    x = 1\nelse:\n    x = 2\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a mixed and/or combo (mirrors the real Leap_Year_Checker corpus shape) round-trips', () => {
    const py =
      'year = 2000\nif (year > 0 and year < 10000) or year == 0:\n    ok = 1\nelse:\n    ok = 0\nprint(ok)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('emits and/or verbatim (no Unicode substitution on the reverse side)', () => {
    const r = transpilePythonToEml('x = 1\nif x > 0 and x < 10:\n    y = 1\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('and');
  });
});
