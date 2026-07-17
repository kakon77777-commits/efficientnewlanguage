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

// Milestone (Phase E2, 2026-07-17): EVERY fixture now round-trips — `class`
// (Phase 7e) was the last forward-only construct, and it round-trips as of
// this phase (see eml-emitter.ts's ClassDef case + py-parser.ts's
// parseClassDef()). `if`/`elif`/`else`, `while`, and `for...in` (Phase 6)
// round-trip as of Phase A (2026-07-16); `break`/`continue` (Phase 7a) as of
// Phase B1 (same day); dict/set literals + subscript (Phase 7b) as of
// Phase B2 (same day); attribute access + bare `import` (Phase 7c) as of
// Phase C (same day); try/except/finally/raise (Phase 7d) as of Phase D
// (same day); function definitions + `return` (Phase 2, the `@cold`/neutral
// subset) as of Phase E1 (same day). The only remaining round-trip
// exception is `@hot` (permanent, not deferred — the forward emitter
// renders it as a comment, never a real decorator; see eml-emitter.ts's
// FunctionDef case) — no fixture uses it, so there's nothing to exclude here.
const roundTrippable = fixtures;

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
