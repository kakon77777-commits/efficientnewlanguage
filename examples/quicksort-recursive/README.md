# Quicksort (recursive)

`quicksort_recursive.eml` sorts a fixed sample list `[5, 2, 9, 1, 5, 6, 3,
8, 4]` (with a repeated value) via recursive quicksort with Lomuto-style
in-place partitioning.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: genuine self-recursion (`quicksort` calling itself on
each side of the pivot) combined with in-place subscript-assignment swaps
(`temp => items[i]`) — the opposite strategy from
[`examples/merge-sort/`](../merge-sort/), which builds brand-new lists via
`+` instead of mutating one in place. Confirms EML's list values carry real
Python reference semantics: mutations inside `partition`/`quicksort` are
visible to the caller across the whole recursive call tree, exactly as in
real Python.

Verify it yourself:

```bash
pnpm eml transpile examples/quicksort-recursive/quicksort_recursive.eml   # -> Python
pnpm eml run examples/quicksort-recursive/quicksort_recursive.eml         # -> before/after lines
pnpm eml trace examples/quicksort-recursive/quicksort_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/quicksort-recursive/quicksort_recursive.eml   # -> OK (fixpoint)
```
