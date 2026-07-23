# Merge two sorted lists

`merge_two_sorted_lists.eml` merges two already-sorted sample lists
(`[1, 4, 6, 9, 15]` and `[2, 3, 5, 8, 10, 20]`) into one sorted list via the
classic two-pointer merge — the building block behind merge sort.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with three sequential
`while` loops (the main two-pointer merge, then two "drain the remainder"
loops) and list growth via `merged + [item] => merged` (no `.append()`, not
modeled) — the same idiom used across the sort/search cases in this batch.

Verify it yourself:

```bash
pnpm eml transpile examples/merge-two-sorted-lists/merge_two_sorted_lists.eml   # -> Python
pnpm eml run examples/merge-two-sorted-lists/merge_two_sorted_lists.eml         # -> merged list
pnpm eml trace examples/merge-two-sorted-lists/merge_two_sorted_lists.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/merge-two-sorted-lists/merge_two_sorted_lists.eml   # -> OK (fixpoint)
```
