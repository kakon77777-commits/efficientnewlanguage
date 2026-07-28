# Arithmetic series (Σ)

`arithmetic_series_sigma.eml` sums arithmetic progressions with EML's
summation operator, checking every result against a closed form.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two shapes of summand.

```eml
Σ(i, i in [1:n])                 -> n(n+1)/2          the Gauss sum
Σ(a + (i - 1) * d, i in [1:n])   -> n(2a + (n-1)d)/2  the general case
```

The general form is the one that matters for EML: the summand is an
**expression in the index**, not merely the index, so the operator is
carrying real work rather than standing in for a `range` sum.

Both families are checked against the **same** general formula rather
than two separate ones. That is deliberate — a formula that happened to
work only for the special case would go unnoticed if the special case had
its own dedicated check. The `a=1 d=1` row is the Gauss sum arrived at
through the general path, so the two agree by construction only if both
are right.

The `d = -2` sample sums to exactly `0` (the progression 5,3,1,-1,-3,-5),
a specific value that a sign error would not reproduce by accident.

Companion to [`examples/sum-of-squares-sigma/`](../sum-of-squares-sigma/),
which introduces the operator.

Verify it yourself:

```bash
pnpm eml transpile examples/arithmetic-series-sigma/arithmetic_series_sigma.eml
pnpm eml run examples/arithmetic-series-sigma/arithmetic_series_sigma.eml         # -> 9 sums + a 9-of-9 summary
pnpm eml trace examples/arithmetic-series-sigma/arithmetic_series_sigma.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/arithmetic-series-sigma/arithmetic_series_sigma.eml   # -> OK (fixpoint)
```
