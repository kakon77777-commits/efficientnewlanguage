# N-Queens

`n_queens.eml` places N queens on an NxN board so none attacks another,
for N = 4, 5, 6 — then renders all four 6-queens solutions.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **backtracking** case — search
that commits to a choice, walks down the branch, discovers it cannot work,
and steps back to try the next option. Distinct from the recursion already
in the corpus, which divides a problem
([`examples/merge-sort/`](../merge-sort/)) or memoizes overlapping
subproblems ([`examples/fibonacci-memoized/`](../fibonacci-memoized/));
here recursion explores a tree of decisions and most branches are dead
ends.

The board is stored as **one column index per row**, which makes row
conflicts impossible by construction — only columns and the two diagonals
need testing. Two queens share a diagonal exactly when the row gap equals
the column gap in either direction.

Correctness is checked against the published solution counts:

| N | Solutions |
| --- | --- |
| 4 | 2 |
| 5 | 10 |
| 6 | 4 |

The **dip at N=6** is what makes this a real check. Solution counts are
not monotonic in N, and a subtly wrong safety test — one that missed a
single diagonal direction, say — would tend to report more solutions and
smooth that dip away. A self-consistent but wrong implementation would
still print three confident numbers.

N=7 (40 solutions) is deliberately excluded: it dominates the search cost
and would push this case's committed execution trace from ~1.7 MB to
roughly 8 MB, which the test suite regenerates and byte-compares on every
run.

Verify it yourself:

```bash
pnpm eml transpile examples/n-queens/n_queens.eml   # -> Python
pnpm eml run examples/n-queens/n_queens.eml         # -> 3 counts, a 3-of-3 summary, 4 rendered boards
pnpm eml trace examples/n-queens/n_queens.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/n-queens/n_queens.eml   # -> OK (fixpoint)
```
