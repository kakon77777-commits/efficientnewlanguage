# Binary search

`binary_search.eml` searches for five sample targets (`34, 100, 3, 91, 50`)
in the fixed pre-sorted list `[3, 8, 15, 22, 34, 41, 56, 63, 79, 91]` using a
manual `while`-loop binary search — no `bisect` module.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with a `while` loop,
`break`, `elif`, and low/high/mid index tracking; `int((low + high) / 2)`
stands in for floor division, since EML has no `//` token (same idiom as
[`examples/digit-sum-calculator/`](../digit-sum-calculator/)).

Verify it yourself:

```bash
pnpm eml transpile examples/binary-search/binary_search.eml   # -> Python
pnpm eml run examples/binary-search/binary_search.eml         # -> found/not-found lines
pnpm eml trace examples/binary-search/binary_search.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/binary-search/binary_search.eml   # -> OK (fixpoint)
```
