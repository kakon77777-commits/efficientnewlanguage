import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { interpret } from '@eml/interp';

/**
 * FLOAT SUMMATION PARITY. `Σ` and the `sum()` builtin both project onto CPython's
 * `sum(...)`, which since 3.12 accumulates floats with Neumaier compensation
 * (`builtin_sum_impl`, Python/bltinmodule.c). The interpreter used to fold with a
 * plain `+`, so it drifted from its own Python projection in the last ulp —
 * `Σ(1 / i, i in [1:1000])` came out 7.485470860550343 against CPython's
 * 7.485470860550345.
 *
 * The regular execution-truth gate (tests/interp.test.ts) is what caught it, via
 * examples/harmonic-series-sigma. This file exists because that gate only covers
 * whatever the corpus happens to contain, and 119 corpus programs summed nothing
 * but integers — where exact bigint accumulation hides the difference entirely.
 * These cases target the float paths deliberately, so a regression is caught by
 * construction rather than by luck.
 *
 * Note `eml trace --run`'s equivalence check does NOT catch this class of bug: it
 * compares floats with a tolerance, and the divergence is one ulp. Only exact
 * stdout comparison against real CPython does.
 */

function resolvePython(): string | null {
  const cands = process.env.EML_PYTHON
    ? [process.env.EML_PYTHON]
    : process.platform === 'win32'
      ? ['python', 'py', 'python3']
      : ['python3', 'python'];
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
  return r.stdout.replace(/\r\n/g, '\n');
}

/**
 * Each case is a full EML program. These were confirmed to discriminate by dropping
 * the compensation term back out of `pySum` and re-running: 11 of the 13 assertions
 * below fail, and the 2 that still pass are exactly the two marked as unaffected —
 * they pin the integer and non-numeric paths the fix must leave alone. An earlier
 * draft also included an alternating series that summed to 0.0 either way, which
 * proved nothing and was replaced.
 */
const CASES: Array<{ name: string; eml: string }> = [
  {
    // The case that exposed the bug. 1/i spans several orders of magnitude, so
    // low-order bits are discarded on nearly every addition.
    name: 'harmonic series, n=1000',
    eml: 'Σ(1 / i, i in [1:1000]) => h\nstr(h)^0\n',
  },
  {
    // Longer run, more accumulated compensation.
    name: 'harmonic series, n=10000',
    eml: 'Σ(1 / i, i in [1:10000]) => h\nstr(h)^0\n',
  },
  {
    // Reciprocal squares: converges, so later terms are tiny against the running
    // total — the classic shape where a naive fold silently drops them.
    name: 'reciprocal squares, n=2000',
    eml: 'Σ(1 / (i * i), i in [1:2000]) => s\nstr(s)^0\n',
  },
  {
    // The true alternating harmonic (-> ln 2), whose sign flip exercises both
    // branches of the Neumaier magnitude test. Doubles as the only corpus-wide
    // pin of a ternary inside a summand.
    name: 'alternating harmonic, n=999',
    eml: 'Σ(i % 2 == 1 ? 1 / i : 0 - 1 / i, i in [1:999]) => s\nstr(s)^0\n',
  },
  {
    // A large term first, then many small ones: the worst case for a naive fold,
    // and the case where compensation matters most.
    name: 'one large term then small ones',
    eml: 'Σ(1 / (i * i * i) + 100000000.0 / i^2, i in [1:500]) => s\nstr(s)^0\n',
  },
  {
    // Mixed int/float summand — exercises the int-prefix -> float transition.
    name: 'int prefix then float',
    eml: 'Σ(i + 1 / i, i in [1:1000]) => s\nstr(s)^0\n',
  },
  {
    // Pure ints: exact on both sides. Pins that the fix did not disturb the
    // arbitrary-precision integer path.
    name: 'pure integer sum (unchanged by compensation)',
    eml: 'Σ(i^2, i in [1:100000]) => s\nstr(s)^0\n',
  },
  {
    // The `sum()` builtin shares the same accumulator, over a list rather than a
    // range. Built by hand because EML has no float `range`.
    name: 'sum() builtin over a float list',
    eml: [
      '[] => xs',
      'for i in [1:800]:',
      '    xs + [1 / i] => xs',
      'sum(xs) => s',
      'str(s)^0',
      '',
    ].join('\n'),
  },
  {
    // `sum()` with an explicit float start value enters float mode immediately.
    name: 'sum() with a float start value',
    eml: [
      '[] => xs',
      'for i in [1:500]:',
      '    xs + [1 / i] => xs',
      'sum(xs, 1000000.0) => s',
      'str(s)^0',
      '',
    ].join('\n'),
  },
  {
    // Non-numeric summand: `sum()` over lists concatenates in Python. Pins the
    // generic fallback path, which compensation must not have broken.
    name: 'sum() over lists (generic fallback path)',
    eml: 'sum([[1, 2], [3], [4, 5]], []) => s\nstr(s)^0\n',
  },
];

describe.skipIf(!PYTHON)('float summation matches CPython exactly', () => {
  for (const { name, eml } of CASES) {
    it(name, () => {
      const { python, ok } = transpileEmlToPython(eml);
      expect(ok, 'case did not transpile').toBe(true);
      const r = interpret(eml);
      expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
      expect(r.output).toBe(pythonStdout(python));
    });
  }
});

describe('compensated summation regression pins', () => {
  /**
   * Literal expected values, independent of whether Python is installed. Each was
   * read off real CPython 3.14.5 and equals `math.fsum` on the same terms; the
   * naive-fold value is recorded beside it so a regression is unambiguous rather
   * than just "some other float".
   */
  const PINS: Array<{ eml: string; expected: string; naiveWouldGive: string }> = [
    {
      eml: 'Σ(1 / i, i in [1:1000]) => h\nstr(h)^0\n',
      expected: '7.485470860550345',
      naiveWouldGive: '7.485470860550343',
    },
    {
      eml: 'Σ(1 / i, i in [1:10000]) => h\nstr(h)^0\n',
      expected: '9.787606036044382',
      naiveWouldGive: '9.787606036044348',
    },
    {
      eml: 'Σ(1 / (i * i), i in [1:2000]) => s\nstr(s)^0\n',
      expected: '1.644434191827393',
      naiveWouldGive: '1.6444341918273961',
    },
  ];

  for (const { eml, expected, naiveWouldGive } of PINS) {
    it(`sums to ${expected} (a naive fold gives ${naiveWouldGive})`, () => {
      const r = interpret(eml);
      expect(r.error, r.error ? `${r.error.type}: ${r.error.message}` : '').toBeUndefined();
      expect(r.output.trim()).toBe(expected);
      expect(r.output.trim()).not.toBe(naiveWouldGive);
    });
  }
});
