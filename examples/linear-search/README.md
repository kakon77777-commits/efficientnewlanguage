# Linear search

`linear_search.eml` searches for five sample targets
(`56, 100, 47, 89, 71`) in the fixed unsorted list
`[47, 12, 89, 3, 56, 23, 89, 71]` via a single scanning loop with `break` on
the first match — the natural counterpart to
[`examples/binary-search/`](../binary-search/)'s pre-sorted,
divide-and-conquer approach. The value `89` is deliberately repeated to
demonstrate that linear search returns the *first* occurrence (index 2, not
6).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with a `for` loop and
`break`, over a module-level list read from inside the function (no
parameter needed for the list itself, only the search target).

Verify it yourself:

```bash
pnpm eml transpile examples/linear-search/linear_search.eml   # -> Python
pnpm eml run examples/linear-search/linear_search.eml         # -> found/not-found lines
pnpm eml trace examples/linear-search/linear_search.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/linear-search/linear_search.eml   # -> OK (fixpoint)
```
