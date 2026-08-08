# Rollup double counts shared parent — the thing it is walking is not a tree

`rollup_double_counts_shared_parent.eml` runs the recursive rollup and a
set-based rollup that visits each node once, then attributes the gap to
specific nodes by counting how many distinct root-to-node paths reach each one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "a node's total is its own value plus the totals of its
children" is correct for a tree. A reorg, a shared service, a component reused
on purpose — each turns the hierarchy into a DAG, and none of them were done by
anyone thinking about the rollup.

```
root: recursive 218, set-based 148, overstated by 70
nodes whose rollup is wrong: 1 of 8
```

Where the 70 comes from, derived rather than assumed:

| node | paths from root | own cost | counted extra |
| --- | --- | --- | --- |
| shared-tools | **2** | 30 | 30 |
| build-team | **2** | 40 | 40 |
| everything else | 1 | — | 0 |

```
overcount predicted from path multiplicity: 70
overcount measured at the root:             70
```

Two independent computations — one by walking, one by counting paths — agreeing
on the same number. That cross-check is what turns "shared nodes get
double-counted" from an explanation into a measurement.

And the number never moves:

```
recursive rollup, run again: 218
recursive rollup, run again: 218
```

Reproducibility is not correctness. A stable wrong total survives review
indefinitely, because every way anyone thinks to check it — re-run it, compare
against last week, hand it to a second person — returns the same answer.

**A wrong check, kept in the file.** The "single-path nodes must roll up
correctly" test first asked `path_count(root, n) == 1`, which is how many paths
reach *n from the root* — a different question from whether *n's own subtree*
contains sharing. The root is the counterexample: exactly one path from `org` to
`org`, and `org` is the only node whose rollup is wrong.

Verify it yourself:

```bash
pnpm eml run examples/rollup-double-counts-shared-parent/rollup_double_counts_shared_parent.eml
```
