# Spiral matrix traversal

`spiral_matrix_traversal.eml` reads a matrix in a clockwise inward spiral,
e.g. the 3x4 grid `1..12` comes out as
`[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: four shrinking boundaries (`top`, `bottom`, `left`,
`right`), peeling off one edge per step. The corpus's third 2D-matrix
case, after
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/) and
[`examples/matrix-multiplication/`](../matrix-multiplication/) — and the
first where all the difficulty is in the traversal **order** rather than
the arithmetic.

The two `if` guards before the bottom row and left column are the part
that is easy to get wrong: without them, a single remaining row would be
emitted twice — once left-to-right on the way in, then again
right-to-left as a "bottom row" that is the same row. The `1x5` and `3x1`
samples exist precisely to catch that; each emits every element exactly
once, which a guard-less version would not.

Verify it yourself:

```bash
pnpm eml transpile examples/spiral-matrix-traversal/spiral_matrix_traversal.eml   # -> Python
pnpm eml run examples/spiral-matrix-traversal/spiral_matrix_traversal.eml         # -> 4 spiral orders (3x4, 3x3, 1x5, 3x1)
pnpm eml trace examples/spiral-matrix-traversal/spiral_matrix_traversal.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/spiral-matrix-traversal/spiral_matrix_traversal.eml   # -> OK (fixpoint)
```
