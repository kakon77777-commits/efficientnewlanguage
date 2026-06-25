import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { transpileEmlToPython } from '@eml/transpiler-python';

function runEml(src: string): string {
  const { python, ok } = transpileEmlToPython(src);
  expect(ok).toBe(true);
  const res = spawnSync('python', ['-c', python], { encoding: 'utf8' });
  if (res.error) throw res.error;
  expect(res.stderr).toBe('');
  expect(res.status).toBe(0);
  return res.stdout.trim();
}

describe('runtime execution (transpile -> python)', () => {
  it('sum of squares 1..100 = 338350 (canonical demo)', () => {
    expect(runEml('N^+100\nΣ(i^2, i in [1:N]) => r\nr^0')).toBe('338350');
  });

  it('output prints the assigned value', () => {
    expect(runEml('x^+100\nx^0')).toBe('100');
  });

  it('augmented add: 100 + 10 = 110', () => {
    expect(runEml('x^+100\nx^+10\nx^0')).toBe('110');
  });

  it('matrix construct + transpose via numpy', () => {
    const out = runEml('<M>([[1, 2], [3, 4]]) => m\nm^T => t\nt^0');
    expect(out).toContain('1');
    expect(out).toContain('4');
  });

  // Numeric proof of the precedence fixes (would be 1.0 / 5 without parens).
  it('division grouping: 10 / (2 / 5) == 25.0', () => {
    expect(runEml('x^+10\ny^+2\nz^+5\nx / (y / z) => r\nr^0')).toBe('25.0');
  });
  it('subtraction grouping: 10 - (3 - 2) == 9', () => {
    expect(runEml('x^+10\ny^+3\nz^+2\nx - (y - z) => r\nr^0')).toBe('9');
  });

  // Phase 2: a @cold pure function (-> @functools.cache) runs and is callable.
  it('cold function: square_sum(100) == 338350', () => {
    const src =
      '@cold\ndef square_sum(N):\n    Σ(i^2, i in [1:N]) => r\n    return r\n\nsquare_sum(100) => total\ntotal^0\n';
    expect(runEml(src)).toBe('338350');
  });
});
