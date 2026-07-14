import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';
import { transpileEmlToPython, analyzeSemantics, checkPurity, classifyLoops } from '@eml/transpiler-python';
import { generateCts } from '@eml/cts-generator';
import { interpret } from '@eml/interp';
import type { FunctionDef, AssignmentStatement, AugmentedAssignStatement } from '@eml/types';

const FIXED_CLOCK = () => '1970-01-01T00:00:00.000Z';

describe('Phase 7b — parser: dict / set literals', () => {
  it('parses an empty {} as a dict (Python parity)', () => {
    const ast = parse('d^+{}\n');
    const stmt = ast.body[0] as unknown as { value: unknown };
    expect(stmt.value).toMatchObject({ type: 'Dict', entries: [] });
  });

  it('parses {k: v, ...} as a dict literal', () => {
    const ast = parse('x^+1\n{"a": 1, "b": x} => e\n');
    const stmt = ast.body[1] as AssignmentStatement;
    expect(stmt.value).toMatchObject({
      type: 'Dict',
      entries: [
        { key: { type: 'StringLiteral', value: 'a' }, value: { type: 'NumberLiteral', raw: '1' } },
        { key: { type: 'StringLiteral', value: 'b' }, value: { type: 'Identifier', name: 'x' } },
      ],
    });
  });

  it('parses {v, ...} as a set literal (no colon)', () => {
    const ast = parse('{1, 2, 3} => s\n');
    const stmt = ast.body[0] as AssignmentStatement;
    expect(stmt.value).toMatchObject({ type: 'Set', elements: [{ raw: '1' }, { raw: '2' }, { raw: '3' }] });
  });
});

describe('Phase 7b — parser: subscript + assignment targets', () => {
  it('parses obj[index] as a Subscript expression', () => {
    const ast = parse('lst^+[1,2,3]\nlst[0] => x\n');
    const stmt = ast.body[1] as AssignmentStatement;
    expect(stmt.value).toMatchObject({ type: 'Subscript', object: { type: 'Identifier', name: 'lst' }, index: { raw: '0' } });
  });

  it('parses a Subscript target on the reversed arrow form (v => d[k])', () => {
    const ast = parse('d^+{}\n1 => d["k"]\n');
    const stmt = ast.body[1] as AssignmentStatement;
    expect(stmt.target).toMatchObject({ type: 'Subscript', object: { type: 'Identifier', name: 'd' }, index: { value: 'k' } });
  });

  it('parses compound-assign operators (+=, -=, *=, /=) target-first', () => {
    const src = 'd^+{}\nd["k"] += 1\nd["k"] -= 1\nd["k"] *= 2\nd["k"] /= 2\n';
    const ast = parse(src);
    const ops = ast.body.slice(1).map((s) => (s as AugmentedAssignStatement).op);
    expect(ops).toEqual(['+', '-', '*', '/']);
    expect((ast.body[1] as AugmentedAssignStatement).target).toMatchObject({ type: 'Subscript' });
  });

  it('a bare identifier can also use the new compound-assign spelling', () => {
    const ast = parse('x^+1\nx += 5\n');
    const stmt = ast.body[1] as AugmentedAssignStatement;
    expect(stmt).toMatchObject({ type: 'AugmentedAssign', target: { type: 'Identifier', name: 'x' }, op: '+' });
  });

  it('rejects a non-assignable compound-assign target (a function call)', () => {
    const r = transpileEmlToPython('f(1) += 1\n');
    expect(r.ok).toBe(false);
    expect(r.diagnostics[0]?.code).toBe('E_PARSE');
  });
});

describe('Phase 7b — semantic: Subscript targets never declare', () => {
  it('a Subscript-target Assignment always has declares:false', () => {
    const src = 'd^+{}\n1 => d["k"]\n';
    const semantic = analyzeSemantics(parse(src));
    const stmt = semantic.program.body[1] as AssignmentStatement;
    expect(stmt.declares).toBe(false);
  });

  it('a Call hidden inside a subscript index does not crash semantic analysis (collectExpr recursion)', () => {
    const r = transpileEmlToPython('lst^+[1,2,3]\ndef idx():\n    return 0\n\n5 => lst[idx()]\n');
    expect(r.ok).toBe(true);
  });
});

describe('Phase 7b — emitter', () => {
  it('emits dict/set literals 1:1', () => {
    const r = transpileEmlToPython('{"a": 1, "b": 2} => d\n{1, 2} => s\n');
    expect(r.python).toContain('d = {"a": 1, "b": 2}');
    expect(r.python).toContain('s = {1, 2}');
  });

  it('emits subscript read/write 1:1, aliasing the object like any identifier', () => {
    const r = transpileEmlToPython('list^+[1,2,3]\nlist[0] => x\n9 => list[1]\n');
    expect(r.python).toContain('x = lst[0]');
    expect(r.python).toContain('lst[1] = 9');
  });

  it('emits compound-assign 1:1', () => {
    const r = transpileEmlToPython('d^+{}\nd["k"] += 1\n');
    expect(r.python).toContain('d["k"] += 1');
  });

  it('parenthesizes a subscript object that binds looser than postfix (the precedence bug this round found)', () => {
    // (a + b)[0] must NOT emit as `a + b[0]` (silently wrong grouping).
    const r = transpileEmlToPython('a^+1\nb^+2\n(a + b)[0] => x\n');
    expect(r.ok).toBe(true);
    expect(r.python).toContain('x = (a + b)[0]');
  });
});

describe('Phase 7b — purity: side effects hidden in a subscript / dict / set', () => {
  it('checkPurity flags an impure builtin call hidden inside a subscript index', () => {
    const fn = parse('def f(lst):\n    lst[input()] => y\n    return y\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity flags an impure builtin call hidden inside a dict value', () => {
    const fn = parse('def f():\n    {"k": input()} => d\n    return d\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(false);
  });

  it('checkPurity is NOT fooled by a subscript/dict with no hidden side effect', () => {
    const fn = parse('def f(lst):\n    lst[0] => y\n    return y\n').body[0] as FunctionDef;
    expect(checkPurity(fn).pure).toBe(true);
  });
});

describe('Phase 7b — loop-classifier / CTS', () => {
  it('classifies a Σ nested inside a subscript index', () => {
    const program = parse('lst^+[1,2,3]\nlst[Σ(1, i in [0:0])] => x\n');
    const loops = classifyLoops(program, []);
    expect(loops.some((l) => l.loopKind === 'algebraic_sum')).toBe(true);
  });

  it('exposes dict.literal/set.literal through generateCts', () => {
    const src = '{"a": 1} => d\n{1, 2} => s\n';
    const r = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 't.eml',
      normalized: r.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
      functions: r.metadata.functions,
    });
    expect(cts.nodes.some((n) => n.semanticType === 'dict.literal')).toBe(true);
    expect(cts.nodes.some((n) => n.semanticType === 'set.literal')).toBe(true);
  });
});

describe('Phase 7b — interpreter: real dict/set/subscript execution', () => {
  it('dict literal + subscript read + compound-assign write', () => {
    const r = interpret(
      'scores^+{"alice": 10, "bob": 20}\nscores["alice"] += 5\nscores["alice"] => total\ntotal^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('15\n');
  });

  it('set literal + membership', () => {
    const r = interpret('nums^+{1, 2, 3}\n4 in nums => has_four\nhas_four^0\n1 in nums => has_one\nhas_one^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    expect(r.output).toBe('False\nTrue\n');
  });

  it('list subscript read (incl. negative index) + write', () => {
    const r = interpret(
      'list^+[10, 20, 30]\nlist[0] => first\nfirst^0\nlist[-1] => last\nlast^0\n99 => list[1]\nlist^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('10\n30\n[10, 99, 30]\n');
  });

  it('dict subscript read of a missing key raises KeyError', () => {
    const r = interpret('d^+{}\nd["missing"] => x\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('KeyError');
  });

  it('list subscript read out of range raises IndexError', () => {
    const r = interpret('lst^+[1,2,3]\nlst[10] => x\nx^0\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('IndexError');
  });

  it('string item assignment raises TypeError (strings are immutable)', () => {
    const r = interpret('s^+"hi"\n5 => s[0]\n', { now: FIXED_CLOCK });
    expect(r.ok).toBe(false);
    expect(r.error?.type).toBe('TypeError');
  });

  it('int/float/bool keys collapse to the same dict key (Python: hash(1)==hash(1.0)==hash(True))', () => {
    const r = interpret('d^+{1: "int"}\n1.0 => d[1.0]\n"one" => d[1.0]\nd[1] => x\nx^0\nlen(d) => n\nn^0\n', {
      now: FIXED_CLOCK,
    });
    expect(r.ok).toBe(true);
    // The later write updates the SAME key (canonicalized), so there's only ever 1 entry.
    expect(r.output).toBe('one\n1\n');
  });

  it('a for-loop can iterate a list built via repeated subscript writes', () => {
    const r = interpret(
      'lst^+[0, 0, 0]\nfor i in [0:2]:\n    i * i => v\n    v => lst[i]\nlst^0\n',
      { now: FIXED_CLOCK },
    );
    expect(r.ok).toBe(true);
    expect(r.output).toBe('[0, 1, 4]\n');
  });
});
