# Subset sum (backtracking)

`subset_sum_backtracking.eml` finds every subset of `[3, 34, 4, 12, 5, 2]`
adding up to 9 — `[3, 4, 2]` and `[4, 5]` — then shows that nothing
reaches 100.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: binary branching — at each item the search goes two
ways, once **including** it and once **excluding** it — plus the pruning
that makes this backtracking rather than brute force.

A plain exhaustive search would build all 2^n subsets and filter at the
end. Abandoning a branch the moment `total > target` cuts most of that
tree away without ever visiting it. Note what licenses that prune: every
number here is **positive**, so overshooting is permanent. With negative
values allowed the same prune would be a bug, silently discarding valid
answers — the assumption is doing real work and is stated in the source
rather than left implicit.

Worth comparing with [`examples/coin-change-dp/`](../coin-change-dp/),
which answers a related question with a table instead of a search:

| | Answers |
| --- | --- |
| `coin-change-dp` | the *fewest* items reaching a total (one optimal number) |
| this case | *every* combination reaching it (all witnesses) |

The unreachable target is included because a search returning nothing must
be distinguishable from a search that is broken — `0` here is a real
answer, since the whole list only sums to 60.

Verify it yourself:

```bash
pnpm eml transpile examples/subset-sum-backtracking/subset_sum_backtracking.eml   # -> Python
pnpm eml run examples/subset-sum-backtracking/subset_sum_backtracking.eml         # -> 2 subsets, then an empty result
pnpm eml trace examples/subset-sum-backtracking/subset_sum_backtracking.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/subset-sum-backtracking/subset_sum_backtracking.eml   # -> OK (fixpoint)
```
