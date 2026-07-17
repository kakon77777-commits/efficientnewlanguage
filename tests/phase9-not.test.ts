import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { parse } from '@eml/parser';
import {
  transpileEmlToPython,
  checkPurity,
  classifyLoops,
} from '@eml/transpiler-python';
import { transpileEmlToCpp } from '@eml/transpiler-cpp';
import { interpret } from '@eml/interp';
import { transpilePythonToEml, roundTripFromPython } from '@eml/transpiler-eml';
import type { FunctionDef } from '@eml/types';

/**
 * Phase 9 — language extension, item 8: unary boolean `not` (real B-6 corpus
 * gap: `Calculate_age`'s `(not leap_year)`, discovered only after the `%`
 * blocker cleared — never reached by any earlier measurement). Same
 * mechanism family as `and`/`or` (a new AST node needing a case in every
 * analysis pass), but simpler in one respect (Python's `not` always returns a
 * bool, unlike `and`/`or`'s operand-return) and more delicate in another: it
 * needed its own new precedence tier, AND a critical C++-specific
 * precedence-bypass fix — see `docs/cpp-feasibility.md`'s divergence note.
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

describe('Phase 9 — forward parser/emitter: not', () => {
  it('parses `not` as a Not node', () => {
    const ast = parse('not x\n');
    const stmt = ast.body[0] as { type: string; expression?: unknown };
    expect(stmt.expression).toMatchObject({ type: 'Not', operand: { type: 'Identifier', name: 'x' } });
  });

  it('`not` binds tighter than comparison (stays bare, no parens)', () => {
    const r = transpileEmlToPython('x^+10\nnot x > 5 => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = not x > 5');
  });

  it('`not` binds looser than `and`/`or` (a grouped or/and keeps its parens)', () => {
    const r = transpileEmlToPython('a^+0\nb^+0\nnot (a or b) => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = not (a or b)');
  });

  it('`not not x` round-trips without extra parens (right-recursive parse)', () => {
    const r = transpileEmlToPython('x^+1\nnot not x => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = not not x');
  });

  it('¬ Unicode display form normalizes to not', () => {
    const r = transpileEmlToPython('x^+0\n¬x => r\nr^0');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.python).toContain('r = not x');
  });
});

describe.skipIf(!PYTHON)('Phase 9 — real Python execution parity (falsy non-bool, not just bool flip)', () => {
  const cases: Array<[string, string, string]> = [
    ['x^+0\nnot x => r\nr^0', 'True', 'not 0 -> True (falsy int, not a real bool)'],
    ['x^+5\nnot x => r\nr^0', 'False', 'not 5 -> False (truthy int)'],
    ['x^+10\nnot x > 5 => r\nr^0', 'False', 'not (x > 5), x=10 -> False'],
    ['x^+3\nnot x > 5 => r\nr^0', 'True', 'not (x > 5), x=3 -> True'],
  ];
  for (const [src, expected, label] of cases) {
    it(label, () => {
      const r = transpileEmlToPython(src);
      expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
      expect(pythonStdout(r.python)).toBe(expected);
      expect(interpret(src).output.trimEnd()).toBe(expected);
    });
  }
});

describe('Phase 9 — purity/importance/loop-classifier do not miss a call/loop hidden inside not', () => {
  it('scanExpression finds an impure call hidden inside `not` (checkPurity)', () => {
    const fn = parse('@cold\ndef f(x):\n    not input(x) => y\n    return y\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('collectCallsExpr finds an interprocedural call hidden inside `not` (W_COLD_SIDE_EFFECT propagates)', () => {
    const r = transpileEmlToPython(
      'def helper(x):\n    input() => u\n    return x\n\n@cold\ndef compute(n):\n    not helper(n) => r\n    return r\n',
    );
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
    const compute = r.metadata.functions.find((f) => f.name === 'compute')!;
    expect(compute.pure).toBe(false);
  });

  it('importance walkExpr counts a call hidden inside `not` toward callFrequency', () => {
    const src = '@cold\ndef sq(N):\n    return N\n\nnot sq(10) => a\n';
    const fn = transpileEmlToPython(src).metadata.functions[0];
    expect(fn.importance.callFrequency).toBe(1);
  });

  it('loop-classifier finds a Σ hidden inside `not`', () => {
    const program = parse('x^+1\nnot Σ(i^2, i in [1:N]) => r\n');
    expect(classifyLoops(program, []).some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });
});

describe('Phase 9 — C++ prototype backend: the precedence-bypass fix', () => {
  it('emits `!(...)` — always parenthesized, unlike every other operator', () => {
    const r = transpileEmlToCpp('x^+1\nnot x => r\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.cpp).toContain('!(x)');
  });

  it('critically parenthesizes a comparison operand: !(x > 5), NOT the wrong !x > 5', () => {
    const r = transpileEmlToCpp('x^+10\nnot x > 5 => r\n');
    expect(r.ok, JSON.stringify(r.diagnostics)).toBe(true);
    expect(r.cpp).toContain('!(x > 5)');
    expect(r.cpp).not.toContain('!x > 5');
  });

  it('self-recursion hidden behind `not` is still rejected (expressionCallsName must not miss it)', () => {
    const r = transpileEmlToCpp('def fact(n):\n    not fact(n) => r\n    return r\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.some((d) => d.code === 'E_CPP_UNSUPPORTED')).toBe(true);
  });
});

describe('Phase 9 — reverse Python->EML: not round-trip', () => {
  it('a bare `not` condition round-trips', () => {
    const py = 'leap_year = True\nif not leap_year:\n    x = 1\nelse:\n    x = 2\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('a Calculate_age-shaped `and (not leap_year)` combo round-trips', () => {
    const py =
      'leap_year = False\nmonth = 2\nif month == 2 and (not leap_year):\n    x = 28\nelse:\n    x = 29\nprint(x)\n';
    const rt = roundTripFromPython(py);
    expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
  });

  it('emits not verbatim (no Unicode substitution on the reverse side)', () => {
    const r = transpilePythonToEml('x = 1\nif not x:\n    y = 1\n');
    expect(r.ok, r.error).toBe(true);
    expect(r.eml).toContain('not x');
  });
});
