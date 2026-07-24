# Merge sort

`merge_sort.eml` sorts a fixed sample list `[8, 3, 5, 1, 9, 2, 7, 4, 6]` via
classic recursive divide-and-conquer merge sort — no `sorted()` builtin.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: slice syntax (`items[0:mid]`/`items[mid:n]`) to split
the list in half, genuine self-recursion (`merge_sort` calling itself on each
half), and a two-pointer merge — the same merge idea as
[`examples/merge-two-sorted-lists/`](../merge-two-sorted-lists/), this time
invoked from inside recursion rather than on two independent lists. Pairs
with [`examples/bubble-sort/`](../bubble-sort/),
[`examples/selection-sort/`](../selection-sort/), and
[`examples/insertion-sort/`](../insertion-sort/) as the corpus's fourth
sorting algorithm, and the first recursive one.

Verify it yourself:

```bash
pnpm eml transpile examples/merge-sort/merge_sort.eml   # -> Python
pnpm eml run examples/merge-sort/merge_sort.eml         # -> before/after lines
pnpm eml trace examples/merge-sort/merge_sort.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/merge-sort/merge_sort.eml   # -> OK (fixpoint)
```
