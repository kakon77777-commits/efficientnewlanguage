# Dot product (Σ)

`dot_product_sigma.eml` computes vector dot products as a summation over
paired list positions.

```eml
Σ(a[i] * b[i], i in [0:n - 1])
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the summand shape the corpus had no example of —
the operator indexing **two** collections at once. The other summation
cases sum a function of the index itself; here the index is a cursor into
data, which is what most real summations actually are.

**Three properties are checked, each failing differently** if the
summation is wrong:

| Property | Why it can fail |
|---|---|
| orthogonality | perpendicular vectors must give exactly `0` — a specific number a broken implementation is unlikely to hit by accident |
| self-product | `a·a` must equal `Σ(a[i]^2)`, so the same data is summed two different ways and compared |
| commutativity | `a·b` must equal `b·a` |

None of these needs an external reference value. That is what makes them
usable as checks rather than decoration — the program can tell you it is
wrong without being told the right answer first.

The `[3,4]·[4,-3]` pair is the interesting one: both components are
non-zero and large, `12 + (-12)`, so a `0` here means the two terms
genuinely cancelled rather than the sum never running.

Verify it yourself:

```bash
pnpm eml transpile examples/dot-product-sigma/dot_product_sigma.eml
pnpm eml run examples/dot-product-sigma/dot_product_sigma.eml         # -> 5 products, 4/4 self, 5/5 commute
pnpm eml trace examples/dot-product-sigma/dot_product_sigma.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/dot-product-sigma/dot_product_sigma.eml   # -> OK (fixpoint)
```
