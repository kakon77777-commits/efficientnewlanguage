# Harmonic series (Σ)

`harmonic_series_sigma.eml` computes harmonic numbers
`H(n) = Σ(1/i, i in [1:n])` — a summation over a **float** summand.

```
H(1)    = 1.0
H(2)    = 1.5
H(4)    = 2.0833333333333335
H(10)   = 2.9289682539682538
H(100)  = 5.187377517639621
H(1000) = 7.485470860550345
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: correctness *without* a reference value.

The corpus's other summation cases have closed forms, so checking them is
"does the sum equal the formula". The harmonic series has no elementary
closed form, so correctness has to be established **structurally**
instead: `H(n)` must equal `H(n-1) + 1/n` for every `n`. The case verifies
that recurrence across 39 values, which pins the summation down with
nothing external to compare against.

That is a different kind of check from the rest of the corpus and worth
having explicitly — plenty of real computations have no closed form to
check against, and "I have no reference value" is not the same as "I
cannot test this".

**The growth is the second reason this series earns a case.** `H(n)`
diverges, but so slowly that going from `n=10` to `n=1000` — a
hundredfold increase — barely doubles the total. The printed table makes
that visible rather than asserted.

## What this case found

It failed the first time it ran, and the failure was real.

`H(1000)` came out `7.485470860550343` from EML's interpreter and
`7.485470860550345` from the transpiled Python. Since CPython 3.12 the
builtin `sum()` accumulates floats with **Neumaier compensated
summation** — it carries the low-order bits each addition discards and
folds them back at the end. `Σ` compiles to `sum(...)`, but the
interpreter was folding with a plain `+`, so it disagreed with its own
Python projection in the last ulp.

This was invisible until now because this is the corpus's first float
summation. The 119 programs before it summed only integers, where EML's
arbitrary-precision arithmetic is exact and the two agree trivially.

Two things are worth noting about how it surfaced:

- **`eml trace --run` did not catch it.** Its equivalence check compares
  floats with a tolerance, and one ulp is well inside it. Only the exact
  stdout comparison against real CPython in `tests/interp.test.ts` did.
- **It was a real bug, not a bad test.** The interpreter now implements
  the same compensation (`pySum` in `packages/interp/src/values.ts`), and
  `tests/sum-compensation.test.ts` pins it deliberately instead of
  relying on some future case happening to sum floats again.

Verify it yourself:

```bash
pnpm eml transpile examples/harmonic-series-sigma/harmonic_series_sigma.eml
pnpm eml run examples/harmonic-series-sigma/harmonic_series_sigma.eml         # -> the table + 39-of-39 recurrence check
pnpm eml trace examples/harmonic-series-sigma/harmonic_series_sigma.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/harmonic-series-sigma/harmonic_series_sigma.eml   # -> OK (fixpoint)
```
