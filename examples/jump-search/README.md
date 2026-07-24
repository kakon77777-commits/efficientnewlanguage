# Jump search

`jump_search.eml` searches for five sample targets (`34, 100, 3, 91, 999`)
in the fixed pre-sorted list `[3, 8, 15, 22, 34, 41, 56, 63, 79, 91, 100,
108, 121]` via jump search.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: EML's native fractional-exponent power operator
(`n^0.5`, the same idiom as
[`examples/quadratic-solver/`](../quadratic-solver/)) to size the jump
block, then a manual block-bound clamp instead of `min()` (interpreter-
deferred). Pairs with
[`examples/binary-search/`](../binary-search/) and
[`examples/linear-search/`](../linear-search/) as the corpus's third search
algorithm — a middle ground between the two: cheaper per-step than binary
search's halving, but far fewer comparisons than a full linear scan.

Verify it yourself:

```bash
pnpm eml transpile examples/jump-search/jump_search.eml   # -> Python
pnpm eml run examples/jump-search/jump_search.eml         # -> found/not-found lines
pnpm eml trace examples/jump-search/jump_search.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/jump-search/jump_search.eml   # -> OK (fixpoint)
```
