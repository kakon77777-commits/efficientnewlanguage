# Euclidean GCD (recursive)

`euclidean_gcd_recursive.eml` computes the greatest common divisor of five
sample pairs (`(48,18)`, `(1071,462)`, `(17,5)`, `(100,75)`, `(0,9)`) via
Euclid's algorithm.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: genuine self-recursion (`gcd` calling itself with
`gcd(b, a % b)`) plus the `%` modulo operator — distinct from the corpus's
earlier [`examples/gcd-lcm-calculator/`](../gcd-lcm-calculator/), whose gcd
turned out iterative on inspection (the same distinction
[`examples/factorial-recursive/`](../factorial-recursive/)'s own header
comment makes for its own corpus siblings). The `(0, 9)` pair exercises the
recursive base case directly (`gcd(0, n)` should return `n`). For-loop
targets in EML must be a single bare identifier (no tuple-unpacking), so
each sample pair is a two-element list, unpacked manually via `pair[0]`/
`pair[1]`.

Verify it yourself:

```bash
pnpm eml transpile examples/euclidean-gcd-recursive/euclidean_gcd_recursive.eml   # -> Python
pnpm eml run examples/euclidean-gcd-recursive/euclidean_gcd_recursive.eml         # -> 5 "a, b -> gcd = g" lines
pnpm eml trace examples/euclidean-gcd-recursive/euclidean_gcd_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/euclidean-gcd-recursive/euclidean_gcd_recursive.eml   # -> OK (fixpoint)
```
