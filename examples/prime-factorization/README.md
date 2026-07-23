# Prime factorization

`prime_factorization.eml` finds the prime factorization (with multiplicity)
of five sample numbers (`60, 97, 360, 1000000, 17`) via trial division — a
manual nested `while` loop — no external number-theory library.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with nested `while` loops,
`%`/`int(x / y)` floor-division (same idiom as
[`examples/digit-sum-calculator/`](../digit-sum-calculator/) and
[`examples/binary-search/`](../binary-search/)), and list growth via
`factors + [divisor] => factors` (no `.append()`, not modeled).

Verify it yourself:

```bash
pnpm eml transpile examples/prime-factorization/prime_factorization.eml   # -> Python
pnpm eml run examples/prime-factorization/prime_factorization.eml         # -> factor lists
pnpm eml trace examples/prime-factorization/prime_factorization.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/prime-factorization/prime_factorization.eml   # -> OK (fixpoint)
```
