# Fraction arithmetic (exact rationals)

`fraction_arithmetic.eml` adds and multiplies fractions held as
`[numerator, denominator]` pairs, always reduced by their greatest common
divisor.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: exact arithmetic, and a direct demonstration of
what floats cannot do:

```
fractions: 1/10 + 2/10 = 3/10
floats:    0.1 + 0.2  = 0.30000000000000004
  the float sum compares UNEQUAL to 0.3
  the fraction sum is exactly 3/10
```

Neither result is a bug. `0.1` and `0.2` have no exact binary
representation, so the float answer is the correct rounding of inputs that
were already wrong. **Choosing a representation is choosing which errors
are possible** — that is the case's actual subject, and it is shown rather
than asserted.

Reuses the Euclidean gcd from
[`examples/euclidean-gcd-recursive/`](../euclidean-gcd-recursive/), here
iterative and applied to canonicalisation:

- **Reduction runs after every operation**, not at the end, which is what
  stops denominators growing without bound across a chain of additions.
- **The sign is kept on the numerator**, so `1/-2` and `-1/2` have one
  canonical form.
- `1/2 + -1/2` normalises to `0/1` rather than `0/4`, so zero has a single
  representation too.

The multiplication samples include two reciprocal pairs (`3/4 * 4/3`,
`2/5 * 5/2`), both of which must land on exactly `1/1` — a result that
reduction has to produce, not merely approximate.

Verify it yourself:

```bash
pnpm eml transpile examples/fraction-arithmetic/fraction_arithmetic.eml   # -> Python
pnpm eml run examples/fraction-arithmetic/fraction_arithmetic.eml         # -> additions, products, float-vs-fraction comparison
pnpm eml trace examples/fraction-arithmetic/fraction_arithmetic.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/fraction-arithmetic/fraction_arithmetic.eml   # -> OK (fixpoint)
```
