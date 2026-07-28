# Variance two ways (Σ)

`variance_with_sigma.eml` computes population variance with two
algebraically identical summations, and shows them disagreeing.

```
definitional    Σ((x - mean)^2) / n
computational   Σ(x^2) / n - mean^2
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a summation whose *result* is fine and whose
*consumer* is not.

On the standard teaching set `[2,4,4,4,5,5,7,9]` both forms give exactly
`4.0`. On values near `1e9` they do not:

```
  definitional  = 1.25
  computational = 0.0
```

The whole answer is gone — not a wobble in the last digit.

**The usual telling of this story does not quite apply to EML**, which is
why the case is worth having. The standard version blames overflow or
loss in the accumulation. Neither happens here: `Σ(x^2)` over those
integers is `4000000020000000030`, an *exact* nineteen-digit integer,
because EML integers are arbitrary-precision. The case prints that number
so the claim is checkable rather than asserted.

The loss happens **after** the sum — dividing that total into a float and
subtracting `mean^2`, two quantities near `1e18` whose true difference is
`1.25`. A float carries about sixteen significant digits, so the
difference falls off the end. The definitional form never builds those
large quantities: it subtracts the mean first, while the numbers are
still small.

So the moral is not "big numbers overflow" but **an exact intermediate
does not protect a computation that ends by subtracting two nearly-equal
floats**. That distinction only becomes visible in a language where the
summation genuinely is exact.

The teaching set is chosen because it checks out by hand — mean 5,
squared deviations 9,1,1,1,0,0,4,16 summing to 32, variance 4, standard
deviation exactly 2 — so the agreeing case can be trusted without
trusting either formula.

Verify it yourself:

```bash
pnpm eml transpile examples/variance-with-sigma/variance_with_sigma.eml
pnpm eml run examples/variance-with-sigma/variance_with_sigma.eml         # -> both samples, one agreeing and one not
pnpm eml trace examples/variance-with-sigma/variance_with_sigma.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/variance-with-sigma/variance_with_sigma.eml   # -> OK (fixpoint)
```
