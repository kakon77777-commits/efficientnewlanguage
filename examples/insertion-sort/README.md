# Insertion sort

`insertion_sort.eml` sorts the sample list `[29, 10, 14, 37, 14, 5, 88]`
(with a deliberate duplicate, `14`) into ascending order using insertion
sort: builds the sorted prefix one element at a time by shifting larger
elements right — the third simple sort in the corpus alongside
[`examples/bubble-sort/`](../bubble-sort/) and
[`examples/selection-sort/`](../selection-sort/).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `while` loop with a compound `and` condition
(`j >= 0 and numbers[j] > key`), shifting list elements via subscript
assignment, and a nested `for`/`while` combination.

Verify it yourself:

```bash
pnpm eml transpile examples/insertion-sort/insertion_sort.eml   # -> Python
pnpm eml run examples/insertion-sort/insertion_sort.eml         # -> sorted list
pnpm eml trace examples/insertion-sort/insertion_sort.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/insertion-sort/insertion_sort.eml   # -> OK (fixpoint)
```
