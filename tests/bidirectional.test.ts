import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  transpilePythonToEml,
  roundTripFromEml,
  roundTripFromPython,
} from '@eml/transpiler-eml';

const reverse = (py: string): string => {
  const r = transpilePythonToEml(py);
  expect(r.ok, r.error).toBe(true);
  return r.eml.trim();
};

describe('Python (subset) -> EML reverse mappings', () => {
  const cases: Array<[string, string]> = [
    ['x = 100', 'x^+100'],
    ['print(x)', 'x^0'],
    ['r = sum(i**2 for i in range(1, N+1))', 'Σ(i^2, i in [1:N]) => r'],
    ['np.transpose(m)', 'm^T'],
    ['A if x > 40 else B', 'x > 40 ? A : B'],
    ['y = f(x)', 'f(x) => y'],
    ['x = 0\nx += 10', 'x^+0\nx^+10'], // augmented '+' needs a prior binding
    ['x -= 5', 'x^-5'],
    ['x *= 2', 'x^*2'],
    ['i in range(1, 11)', 'i in [1:10]'],
    ['sum(i for i in range(1, 11))', 'Σ(i, i in [1:10])'],
    ['np.array(data)', '<M>(data)'],
    ['r = f(x, y)', 'f(x, y) => r'],
    ['lst = [1, 2, 3]', 'lst^+[1, 2, 3]'],
  ];
  for (const [py, eml] of cases) {
    it(`${py}  ->  ${eml}`, () => {
      expect(reverse(py)).toBe(eml);
    });
  }

  it('ignores import lines', () => {
    expect(reverse('import numpy as np\nnp.array(data)')).toBe('<M>(data)');
  });
});

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, 'fixtures');
const fixtures = readdirSync(fixturesDir).filter((f) => f.endsWith('.eml')).sort();

// Functions (`def` / decorators, Phase 2) and control flow (`if`/`elif`/`else`/
// `while`/`for`, Phase 6) are forward-only constructs: the reverse Python->EML
// path stays statement-level, so fixtures using them are not expected to
// round-trip (see eml-emitter.ts's throwing cases + py-parser.ts's lack of
// if/while/for/def handling). The fixpoint checks cover the round-trippable subset.
const roundTrippable = fixtures.filter(
  (f) => !/\b(def|if|elif|else|while|for)\b/.test(readFileSync(join(fixturesDir, f), 'utf8')),
);

describe('round-trip EML -> Python -> EML -> Python (fixpoint)', () => {
  for (const f of roundTrippable) {
    it(f, () => {
      const eml = readFileSync(join(fixturesDir, f), 'utf8');
      const rt = roundTripFromEml(eml);
      expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
    });
  }
});

describe('round-trip Python -> EML -> Python (fixpoint)', () => {
  for (const f of roundTrippable) {
    const base = f.replace(/\.eml$/, '');
    it(`${base}.expected.py`, () => {
      const py = readFileSync(join(fixturesDir, `${base}.expected.py`), 'utf8');
      const rt = roundTripFromPython(py);
      expect(rt.ok, rt.message + '\n' + JSON.stringify(rt.steps, null, 2)).toBe(true);
    });
  }
});
