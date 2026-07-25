# Edit distance (Levenshtein)

`edit_distance.eml` computes the fewest single-character insertions,
deletions or substitutions needed to turn one string into another, for
five sample pairs — including the canonical `'kitten' -> 'sitting' : 3`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **bottom-up 2D dynamic-
programming table** — [`examples/fibonacci-memoized/`](../fibonacci-memoized/)
covers the top-down memoized style instead. Builds an `(n+1) x (m+1)`
table by row growth, seeds the two base edges, then fills it with the
standard deletion/insertion/substitution recurrence using chained
subscript assignment (`best + 1 => table[i][j]`).

`min()` is interpreter-deferred, so the three-way minimum is picked by
hand with two comparisons — the same reason
[`examples/jump-search/`](../jump-search/) clamps its block bound
manually.

Verify it yourself:

```bash
pnpm eml transpile examples/edit-distance/edit_distance.eml   # -> Python
pnpm eml run examples/edit-distance/edit_distance.eml         # -> 5 "'a' -> 'b' : n" lines
pnpm eml trace examples/edit-distance/edit_distance.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/edit-distance/edit_distance.eml   # -> OK (fixpoint)
```
