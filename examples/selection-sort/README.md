# Selection sort

`selection_sort.eml` sorts the sample list `[64, 25, 12, 22, 11, 90, 34]`
into ascending order using selection sort: for each position, scan the
remainder for the minimum and swap it into place once — a different
strategy from [`examples/bubble-sort/`](../bubble-sort/)'s repeated
adjacent-element swap.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nested `for` loops over expression-bound inclusive
ranges, `len()`, and in-place list mutation via subscript assignment (same
`numbers[i] => numbers[i]`-style swap idiom as `bubble-sort`).

Verify it yourself:

```bash
pnpm eml transpile examples/selection-sort/selection_sort.eml   # -> Python
pnpm eml run examples/selection-sort/selection_sort.eml         # -> sorted list
pnpm eml trace examples/selection-sort/selection_sort.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/selection-sort/selection_sort.eml   # -> OK (fixpoint)
```
