# Counting sort

`counting_sort.eml` sorts a fixed sample list `[4, 2, 2, 8, 3, 3, 1, 0, 5]`
(values known to be in `0..8`) via counting sort.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a non-comparison sort — tallies occurrences into a
`counts` list (subscript read-then-write in one statement,
`counts[value] + 1 => counts[value]`), then reconstructs the sorted output
from the tally — a genuinely different algorithmic family from the
corpus's comparison-based sorts
([`examples/bubble-sort/`](../bubble-sort/),
[`examples/selection-sort/`](../selection-sort/),
[`examples/insertion-sort/`](../insertion-sort/),
[`examples/merge-sort/`](../merge-sort/),
[`examples/quicksort-recursive/`](../quicksort-recursive/)).

Verify it yourself:

```bash
pnpm eml transpile examples/counting-sort/counting_sort.eml   # -> Python
pnpm eml run examples/counting-sort/counting_sort.eml         # -> before/after lines
pnpm eml trace examples/counting-sort/counting_sort.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/counting-sort/counting_sort.eml   # -> OK (fixpoint)
```
