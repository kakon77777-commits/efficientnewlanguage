import { describe, it, expect } from 'vitest';
import { parse, lex, normalizeSource } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics, checkPurity, classifyLoops } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { interpret } from '@eml/interp';
import type { FunctionDef, IfStatement, WhileStatement, ForInStatement } from '@eml/types';

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

describe('Phase 6 — parser: if/elif/else, while, for...in', () => {
  it('parses a bare if with no elif/else', () => {
    const ast = parse('if x > 5:\n    y^+1\n');
    const stmt = ast.body[0] as IfStatement;
    expect(stmt.type).toBe('If');
    expect(stmt.test).toMatchObject({ type: 'Comparison', op: '>' });
    expect(stmt.body).toHaveLength(1);
    expect(stmt.orelse).toEqual([]);
  });

  it('parses if/else', () => {
    // Raw parser output, pre-semantic-resolution: `y^+2` is still an OverlayAssign
    // (parse() alone never resolves it to Assignment/AugmentedAssign).
    const ast = parse('if x > 5:\n    y^+1\nelse:\n    y^+2\n');
    const stmt = ast.body[0] as IfStatement;
    expect(stmt.orelse).toHaveLength(1);
    expect(stmt.orelse[0]!.type).toBe('OverlayAssign');
  });

  it('parses if/elif/else as a nested If chain (not a separate elifs array)', () => {
    const ast = parse('if a > 1:\n    x^+1\nelif a > 2:\n    x^+2\nelse:\n    x^+3\n');
    const stmt = ast.body[0] as IfStatement;
    expect(stmt.orelse).toHaveLength(1);
    expect(stmt.orelse[0]).toMatchObject({
      type: 'If',
      test: { type: 'Comparison', op: '>' },
      orelse: [{ type: 'OverlayAssign' }],
    });
  });

  it('parses while', () => {
    const ast = parse('while n > 0:\n    n^-1\n');
    const stmt = ast.body[0] as WhileStatement;
    expect(stmt.type).toBe('While');
    expect(stmt.test).toMatchObject({ type: 'Comparison', op: '>' });
    expect(stmt.body).toHaveLength(1);
  });

  it('parses for...in over a range', () => {
    const ast = parse('for i in [1:10]:\n    i^0\n');
    const stmt = ast.body[0] as ForInStatement;
    expect(stmt.type).toBe('ForIn');
    expect(stmt.target).toEqual({ type: 'Identifier', name: 'i' });
    expect(stmt.iterable).toMatchObject({ type: 'Range' });
  });

  it('parses for...in over a list literal', () => {
    const ast = parse('list^+[1,2,3]\nfor v in lst:\n    v^0\n');
    const stmt = ast.body[1] as ForInStatement;
    expect(stmt.iterable).toMatchObject({ type: 'Identifier', name: 'lst' });
  });

  it('gates INDENT/DEDENT around if/while/for blocks', () => {
    const tokens = lex(normalizeSource('if x > 5:\n    y^+1\n')).map((t) => t.type);
    expect(tokens).toContain('INDENT');
    expect(tokens).toContain('DEDENT');
  });

  it('rejects an if/while/for with no indented body at all (E_PARSE)', () => {
    expect(transpileEmlToPython('if x > 5:\n').diagnostics[0]).toMatchObject({ code: 'E_PARSE' });
    expect(transpileEmlToPython('while x > 5:\n').diagnostics[0]).toMatchObject({ code: 'E_PARSE' });
    expect(transpileEmlToPython('for i in [1:5]:\n').diagnostics[0]).toMatchObject({ code: 'E_PARSE' });
  });

  it('rejects a dangling elif/else with no preceding if (falls through to a loud parse error)', () => {
    const rElif = transpileEmlToPython('elif x > 5:\n    y^+1\n');
    expect(rElif.ok).toBe(false);
    expect(rElif.diagnostics[0]).toMatchObject({ code: 'E_PARSE', message: expect.stringContaining('ELIF') });
    const rElse = transpileEmlToPython('else:\n    y^+1\n');
    expect(rElse.ok).toBe(false);
    expect(rElse.diagnostics[0]).toMatchObject({ code: 'E_PARSE', message: expect.stringContaining('ELSE') });
  });
});

describe('Phase 6 — semantic: branch-scoped declares (the critical regression)', () => {
  it('both if and else branches declaring the same new name each resolve to Assignment, not AugmentedAssign', () => {
    const src = 'x^+15\nif x > 5:\n    y^+1\nelse:\n    y^+2\n';
    const ast = analyzeSemantics(parse(src)).program;
    const ifStmt = ast.body[1] as IfStatement;
    expect(ifStmt.body[0]).toMatchObject({ type: 'Assignment', declares: true });
    expect(ifStmt.orelse[0]).toMatchObject({ type: 'Assignment', declares: true });
  });

  it('a name declared in every branch is visible as already-declared after the if-statement', () => {
    const r = transpileEmlToPython('x^+15\nif x > 5:\n    y^+1\nelse:\n    y^+2\ny^0\n');
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).toContain('y');
    expect(r.python).toContain('print(y)');
  });

  it('an elif chain composes the branch-scope fix through multiple levels', () => {
    const r = transpileEmlToPython(
      'x^+15\nif x > 20:\n    y^+1\nelif x > 10:\n    y^+2\nelse:\n    y^+3\ny^0\n',
    );
    expect(r.ok).toBe(true);
    expect(r.python).toContain('if x > 20:');
    expect(r.python).toContain('elif x > 10:');
    expect(r.python).toContain('else:');
  });

  it('W_AUG_UNDECLARED still fires for a branch-local undeclared augment', () => {
    const r = transpileEmlToPython('x^+15\nif x > 5:\n    y^-1\n');
    expect(r.diagnostics.find((d) => d.code === 'W_AUG_UNDECLARED')).toBeDefined();
  });

  it('E_RETURN_OUTSIDE_FN fires for a module-level if/while/for, not a function-level one', () => {
    expect(
      transpileEmlToPython('if 1 > 0:\n    return 1\n').diagnostics.find((d) => d.code === 'E_RETURN_OUTSIDE_FN'),
    ).toBeDefined();
    expect(
      transpileEmlToPython('def f(n):\n    if n > 0:\n        return n\n    return 0\n').diagnostics.find(
        (d) => d.code === 'E_RETURN_OUTSIDE_FN',
      ),
    ).toBeUndefined();
  });

  it('a for-loop target participates in E_ALIAS_COLLISION when it collides with another declared name', () => {
    // 'lst' and 'list' both alias to the Python name 'lst'.
    const r = transpileEmlToPython('lst^+1\nfor list in [1:3]:\n    list^0\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics.find((d) => d.code === 'E_ALIAS_COLLISION')).toBeDefined();
  });

  it('a for-loop target is recorded in declaredNames (aliased)', () => {
    const r = transpileEmlToPython('for list in [1:3]:\n    list^0\n');
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).toContain('lst');
  });

  it('a while loop does not introduce a new scope: a name assigned inside is visible after', () => {
    const r = transpileEmlToPython('n^+3\nwhile n > 0:\n    total^+1\n    n^-1\ntotal^0\n');
    expect(r.ok).toBe(true);
    expect(r.metadata.declaredNames).toContain('total');
  });
});

describe('Phase 6 — emitter: Python output', () => {
  it('emits if/else 1:1', () => {
    const r = transpileEmlToPython('x^+1\nif x > 0:\n    y^+1\nelse:\n    y^+2\n');
    expect(r.python).toBe('x = 1\nif x > 0:\n    y = 1\nelse:\n    y = 2\n');
  });

  it('collapses an elif chain instead of nesting else: if', () => {
    const r = transpileEmlToPython('x^+1\nif x > 2:\n    y^+1\nelif x > 1:\n    y^+2\nelse:\n    y^+3\n');
    expect(r.python).not.toContain('else:\n    if');
    expect(r.python).toContain('elif x > 1:');
  });

  it('emits while 1:1', () => {
    const r = transpileEmlToPython('n^+1\nwhile n > 0:\n    n^-1\n');
    expect(r.python).toBe('n = 1\nwhile n > 0:\n    n -= 1\n');
  });

  it('emits for...in 1:1, aliasing the target like any other identifier', () => {
    const r = transpileEmlToPython('for list in [1:3]:\n    list^0\n');
    expect(r.python).toBe('for lst in range(1, 4):\n    print(lst)\n');
  });
});

describe('Phase 6 — purity/importance: side effects hidden in branches/loops', () => {
  it('checkPurity flags a print() hidden inside an if-branch', () => {
    const fn = parse('def f(x):\n    if x > 0:\n        x^0\n    return x\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity flags a print() hidden inside a while-body', () => {
    const fn = parse('def f(x):\n    while x > 0:\n        x^0\n        x^-1\n    return x\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity flags a print() hidden inside a for-body', () => {
    const fn = parse('def f(x):\n    for i in [1:3]:\n        i^0\n    return x\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('a @cold function with a side effect hidden in an if-branch still warns W_COLD_SIDE_EFFECT', () => {
    const r = transpileEmlToPython('@cold\ndef f(x):\n    if x > 0:\n        x^0\n    return x\n');
    expect(r.diagnostics.find((d) => d.code === 'W_COLD_SIDE_EFFECT')).toBeDefined();
    expect(r.metadata.functions[0]!.pure).toBe(false);
  });

  it('a @cold function with NO side effects in its branches is still reported pure', () => {
    const r = transpileEmlToPython('@cold\ndef f(x):\n    if x > 0:\n        return x\n    return 0\n');
    expect(r.diagnostics.filter((d) => d.code === 'W_COLD_SIDE_EFFECT')).toHaveLength(0);
    expect(r.metadata.functions[0]!.pure).toBe(true);
  });

  it('call frequency counts a call made from inside an if/while/for body', () => {
    const r = transpileEmlToPython(
      '@cold\ndef helper(n):\n    return n\n\ndef caller(x):\n    if x > 0:\n        helper(x) => r\n        return r\n    return 0\n',
    );
    const helper = r.metadata.functions.find((f) => f.name === 'helper')!;
    expect(helper.importance.callFrequency).toBe(1);
  });
});

describe('Phase 6 — loop-classifier / CTS', () => {
  it('classifies a Σ nested inside an if-branch', () => {
    const program = parse('if 1 > 0:\n    Σ(i^2, i in [1:N]) => r\n');
    const loops = classifyLoops(program, []);
    expect(loops.some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });

  it('classifies a Σ nested inside a for-body', () => {
    const program = parse('for i in [1:3]:\n    Σ(j^2, j in [1:i]) => r\n');
    const loops = classifyLoops(program, []);
    expect(loops.some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });

  it('registers bare while/for statements as while_loop/for_loop kinds', () => {
    const program = parse('while 1 > 0:\n    x^0\n');
    expect(classifyLoops(program, []).some((l) => l.loopKind === 'while_loop')).toBe(true);
    const program2 = parse('for i in [1:3]:\n    i^0\n');
    expect(classifyLoops(program2, []).some((l) => l.loopKind === 'for_loop')).toBe(true);
  });

  it('exposes control.if/control.while/control.for through generateCts', () => {
    const src = 'x^+1\nif x > 0:\n    y^+1\n';
    const r = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    expect(cts.nodes.some((n) => n.semanticType === 'control.if')).toBe(true);
  });
});

describe('Phase 6 — interpreter: real execution semantics', () => {
  it('if/elif/else selects the correct branch', () => {
    const r = interpret('x^+15\nif x > 20:\n    y^+1\nelif x > 10:\n    y^+2\nelse:\n    y^+3\ny^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('2\n');
  });

  it('a while loop accumulates correctly', () => {
    const r = interpret('n^+5\ntotal^+0\nwhile n > 0:\n    total + n => total\n    n - 1 => n\ntotal^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('15\n');
  });

  it('a for loop over a range accumulates correctly', () => {
    const r = interpret('N^+5\ntotal^+0\nfor i in [1:N]:\n    total + i^2 => total\ntotal^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('55\n');
  });

  it('a for-loop target leaks its final value after the loop (Python semantics)', () => {
    const r = interpret('for i in [1:3]:\n    i^0\ni^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('1\n2\n3\n3\n');
  });

  it('an infinite while loop hits the step budget rather than hanging', () => {
    const r = interpret('while 1 == 1:\n    x^+1\n', { now: FIXED_CLOCK, maxSteps: 50 });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('StepLimitExceeded');
  });

  it('return inside a nested if/while unwinds out of both to the caller', () => {
    const r = interpret(
      'def f(n):\n    while n > 0:\n        if n == 3:\n            return n\n        n - 1 => n\n    return 0 - 1\n\nf(5) => r\nr^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('3\n');
  });
});
