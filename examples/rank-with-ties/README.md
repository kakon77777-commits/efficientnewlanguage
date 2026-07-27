# Ranking with ties

`rank_with_ties.eml` ranks a leaderboard containing two pairs of tied
scores, under both standard conventions at once:

```
  player     score  competition  dense
  Ada        95     1            1
  Grace      88     2            2
  Alan       88     2            2
  Edsger     74     4            3
  Barbara    74     4            3
  Donald     61     6            4
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the fact that "rank" is **not one function**.

| Convention | Result | Meaning |
| --- | --- | --- |
| **Competition** | 1, 2, 2, **4**, 4, **6** | tied players share the better rank and the next rank *skips* — "joint second, nobody third". How sports results are reported. |
| **Dense** | 1, 2, 2, **3**, 3, **4** | tied players share a rank and ranks stay consecutive. What you want when the rank is really a tier label. |

Neither is more correct; they answer different questions. A case showing
only one would make "the" ranking look like a settled matter, and a reader
would have no way to tell which convention they were being handed — which
is exactly how this becomes a bug in real leaderboards.

Both are computed **by counting** rather than by walking a sorted list and
tracking state:

- competition rank = 1 + how many scores are strictly greater
- dense rank = 1 + how many **distinct** scores are strictly greater

Counting makes ties fall out automatically, with no special case for "the
previous score was the same" — the usual source of off-by-one errors in
hand-rolled ranking code. The dense version reuses the dict-as-set idiom
from [`examples/duplicate-remover/`](../duplicate-remover/) to count
distinct values.

Verify it yourself:

```bash
pnpm eml transpile examples/rank-with-ties/rank_with_ties.eml   # -> Python
pnpm eml run examples/rank-with-ties/rank_with_ties.eml         # -> the leaderboard under both conventions
pnpm eml trace examples/rank-with-ties/rank_with_ties.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/rank-with-ties/rank_with_ties.eml   # -> OK (fixpoint)
```
