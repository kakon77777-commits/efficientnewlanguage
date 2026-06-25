import { describe, it, expect } from 'vitest';
import { transpileEmlToPython, analyzeSemantics } from '@eml/transpiler-python';
import { parse } from '@eml/parser';
import { generateCts } from '@eml/cts-generator';

describe('CTS generation (PHOSPHOR-compatible)', () => {
  it('produces nodes, symbols, and crossRef for the sum demo', () => {
    const src = 'N^+100\nΣ(i^2, i in [1:N]) => r\nr^0';
    const result = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 'sum.eml',
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
    });

    expect(cts.nodes).toHaveLength(3);
    expect(cts.nodes[1]).toMatchObject({
      semanticType: 'algebraic.sum',
      python: 'r = sum(i**2 for i in range(1, N+1))',
    });
    expect(cts.nodes[1]!.dependencies).toContain('N');
    expect(cts.nodes[1]!.dependencies).toContain('i');
    expect(cts.symbols['Σ']).toMatchObject({ meaning: 'summation' });
    // crossRefTable maps the bound name to the *producing expression* (no `=> r`).
    expect(cts.crossRefTable['r']).toEqual(['Σ(i^2, i in [1:N])']);
  });

  it('crossRefTable and dependencies use the emitted (aliased) name for list', () => {
    const src = 'list^+[1,2,3]';
    const result = transpileEmlToPython(src);
    const semantic = analyzeSemantics(parse(src));
    const cts = generateCts({
      fileName: 'l.eml',
      normalized: result.normalized,
      program: semantic.program,
      symbolsUsed: semantic.symbolsUsed,
    });
    expect(cts.crossRefTable['lst']).toBeDefined();
    expect(cts.crossRefTable['list']).toBeUndefined();
  });
});
