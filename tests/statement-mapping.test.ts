import { describe, it, expect } from 'vitest';
import { transpileLine } from '@eml/transpiler-python';

/**
 * The 14 documented EML/Py+ -> Python statement mappings (whitepaper Appendix A,
 * grammar §5). Body-only, exact strings. Cases 07-09 (augmented assigns) pass a
 * pre-declared context so `x^+n` resolves to `+=` rather than initialization.
 */
const cases: Array<[string, string, string[]?]> = [
  ['x^+100', 'x = 100'],
  ['x^0', 'print(x)'],
  ['Σ(i^2, i in [1:N])', 'sum(i**2 for i in range(1, N+1))'],
  ['m^T', 'np.transpose(m)'],
  ['x > 40 ? A : B', 'A if x > 40 else B'],
  ['f(x) => y', 'y = f(x)'],
  ['x^+10', 'x += 10', ['x']],
  ['x^-5', 'x -= 5', ['x']],
  ['x^*2', 'x *= 2', ['x']],
  ['i in [1:10]', 'i in range(1, 11)'],
  ['Σ(i, i in [1:10])', 'sum(i for i in range(1, 11))'],
  ['<M>(data)', 'np.array(data)'],
  ['f^+(x,y) => r', 'r = f(x, y)'],
  ['list^+[1,2,3]', 'lst = [1, 2, 3]'],
];

describe('14 documented statement mappings', () => {
  for (const [input, expected, declared] of cases) {
    it(`${input}  ->  ${expected}`, () => {
      expect(transpileLine(input, declared ? { declared } : {})).toBe(expected);
    });
  }
});
