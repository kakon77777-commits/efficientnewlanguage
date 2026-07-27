# Permutations generator

`permutations_generator.eml` produces every ordering of a list — all 6 of
`["A","B","C"]`, then confirms 24 for a four-item list.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: recursive backtracking used for **generation**
rather than search — [`examples/n-queens/`](../n-queens/) prunes branches
that violate a constraint, this one keeps every complete branch.

The case exists for a contrast in how its two pieces of state are
handled:

| State | Passed how | Needs undoing? |
| --- | --- | --- |
| `used` | one flag list, **mutated in place** — a write is visible to every deeper call | **Yes** — `0 => used[i]` after the recursive call, or later branches would see items still taken |
| `current` | **rebuilt** by `+` on the way down, so each call gets its own prefix | No — nothing to restore |

Same algorithm, two kinds of state, only one of which needs a manual step
back. Forgetting that undo is *the* classic backtracking bug, and here it
would surface immediately as a short result list rather than as subtly
wrong output — 3 permutations instead of 6.

The `3! = 6` and `4! = 24` annotations make the count checkable at a
glance without recomputing anything.

Verify it yourself:

```bash
pnpm eml transpile examples/permutations-generator/permutations_generator.eml   # -> Python
pnpm eml run examples/permutations-generator/permutations_generator.eml         # -> 6 orderings + two counts
pnpm eml trace examples/permutations-generator/permutations_generator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/permutations-generator/permutations_generator.eml   # -> OK (fixpoint)
```
