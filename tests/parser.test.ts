import { describe, it, expect } from 'vitest';
import { parse } from '@eml/parser';

describe('parser AST shapes', () => {
  it('parses sum assignment via arrow', () => {
    const ast = parse('Σ(i^2, i in [1:N]) => r');
    expect(ast.body[0]).toMatchObject({
      type: 'Assignment',
      target: { name: 'r' },
      value: {
        type: 'Sum',
        iterator: { name: 'i' },
        range: { type: 'Range', inclusiveEnd: true },
      },
    });
  });

  it('parses overlay output', () => {
    expect(parse('x^0').body[0]).toMatchObject({
      type: 'Output',
      value: { name: 'x' },
    });
  });

  it('parses overlay assign (unresolved)', () => {
    expect(parse('x^+100').body[0]).toMatchObject({
      type: 'OverlayAssign',
      op: '+',
      target: { name: 'x' },
    });
  });

  it('parses conditional expression statement', () => {
    expect(parse('x > 40 ? A : B').body[0]).toMatchObject({
      type: 'ExpressionStatement',
      expression: { type: 'Conditional' },
    });
  });

  it('parses membership', () => {
    expect(parse('i in [1:10]').body[0]).toMatchObject({
      type: 'ExpressionStatement',
      expression: { type: 'Membership' },
    });
  });

  it('parses function-call assignment', () => {
    expect(parse('f^+(x,y) => r').body[0]).toMatchObject({
      type: 'Assignment',
      value: { type: 'Call', callee: { name: 'f' }, args: [{ name: 'x' }, { name: 'y' }] },
    });
  });

  it('parses list assignment', () => {
    expect(parse('list^+[1,2,3]').body[0]).toMatchObject({
      type: 'Assignment',
      target: { name: 'list' },
      value: { type: 'List' },
    });
  });

  it('parses matrix and transpose', () => {
    expect(parse('<M>(data)').body[0]).toMatchObject({
      type: 'ExpressionStatement',
      expression: { type: 'Matrix' },
    });
    expect(parse('m^T').body[0]).toMatchObject({
      type: 'ExpressionStatement',
      expression: { type: 'Transpose', operand: { name: 'm' } },
    });
  });
});
