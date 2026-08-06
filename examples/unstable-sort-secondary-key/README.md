# Unstable sort, secondary key — sorted by department, names out of order

`unstable_sort_secondary_key.eml` runs the two-pass sorting idiom — sort by
name, then sort by department — with a stable and an unstable second pass, and
counts how many departments kept their names in order.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "sort by department, then by name within each
department" is usually written as two sorts, and that idiom is correct if and
only if the second sort preserves the relative order of records it considers
equal. Stability is not part of what "sorted" means.

| second pass | departments whose names came out ordered |
| --- | --- |
| stable (insertion) | 3/3 |
| unstable (selection) | **1/3** |

Neither sort is wrong. Selection sort swaps the minimum into place from
wherever it was, throwing whatever occupied that position to the far end — a
correct sort that makes no promise about equal keys.

The check that explains why this ships: **both outputs are sorted by
department**. The primary key is correct in both arms, so the obvious assertion
passes. Both also contain exactly the same 9 records — nothing was lost or
duplicated, only reordered inside a group.

And the survival mechanism, measured: running the same two passes over the
first *k* records for k = 2..9, the defect is visible at **3 of 8** sizes. A
fixture that happens to land on one of the other five shows nothing.

Verify it yourself:

```bash
pnpm eml run examples/unstable-sort-secondary-key/unstable_sort_secondary_key.eml
```

```bash
pnpm eml trace examples/unstable-sort-secondary-key/unstable_sort_secondary_key.eml --run
```
