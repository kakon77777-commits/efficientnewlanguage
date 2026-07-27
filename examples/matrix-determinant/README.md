# Matrix determinant (cofactor expansion)

`matrix_determinant.eml` computes determinants by expanding along the top
row and recursing on each minor, checked against five independently known
answers.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's third hand-rolled matrix case, after
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/) and
[`examples/matrix-multiplication/`](../matrix-multiplication/) — and the
first that is **recursive on the structure itself**: the minor of an NxN
matrix is an (N-1)x(N-1) matrix, so the data shrinks along with the
recursion.

Each test matrix has a determinant fixed by something other than this
algorithm:

| Matrix | Determinant | Known because |
| --- | --- | --- |
| `[[1,2],[3,4]]` | -2 | the `ad - bc` rule directly |
| `[[6,1,1],[4,-2,5],[2,8,7]]` | -306 | standard worked textbook example |
| 3x3 identity | 1 | by definition |
| `[[1,2],[2,4]]` | 0 | singular — row 2 is twice row 1 |
| 4x4 lower triangular | 120 | product of the diagonal, `2*3*4*5` |

**The triangular matrix is the strongest of the five.** Its answer follows
from a rule that has nothing to do with cofactor expansion, so agreement
between the two is real evidence rather than the method confirming itself
— and being 4x4, it is the only one exercising two full levels of minors.
The singular matrix matters for the opposite reason: `0` is a specific
answer that a broken implementation is unlikely to hit by accident.

Verify it yourself:

```bash
pnpm eml transpile examples/matrix-determinant/matrix_determinant.eml   # -> Python
pnpm eml run examples/matrix-determinant/matrix_determinant.eml         # -> 5 determinants + a 5-of-5 summary
pnpm eml trace examples/matrix-determinant/matrix_determinant.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/matrix-determinant/matrix_determinant.eml   # -> OK (fixpoint)
```
