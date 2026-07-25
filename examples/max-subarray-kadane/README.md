# Maximum subarray (Kadane's algorithm)

`max_subarray_kadane.eml` finds the largest sum obtainable from any
contiguous run of a list, for five samples — including the classic
`[-2, 1, -3, 4, -1, 2, 1, -5, 4] -> 6`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: dynamic programming with **no table at all**. The
entire "best subproblem so far" state collapses into a single running
variable, which makes this a useful contrast with the corpus's
table-based DP cases —
[`examples/edit-distance/`](../edit-distance/) and
[`examples/longest-common-subsequence/`](../longest-common-subsequence/)
(2D grids) and [`examples/coin-change-dp/`](../coin-change-dp/) (1D array).

The all-negative sample `[-5, -2, -8] -> -2` is the load-bearing one: a
version that seeds `best` at `0` instead of at the first element would
wrongly answer `0`, having silently allowed the empty subarray. Seeding
from `numbers[0]` is what makes the "at least one element" requirement
real.

Verify it yourself:

```bash
pnpm eml transpile examples/max-subarray-kadane/max_subarray_kadane.eml   # -> Python
pnpm eml run examples/max-subarray-kadane/max_subarray_kadane.eml         # -> 5 "list -> best" lines
pnpm eml trace examples/max-subarray-kadane/max_subarray_kadane.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/max-subarray-kadane/max_subarray_kadane.eml   # -> OK (fixpoint)
```
