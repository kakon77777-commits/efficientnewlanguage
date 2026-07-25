# Matrix multiplication

`matrix_multiplication.eml` multiplies a 2x3 matrix by a 3x2 matrix,
producing the 2x2 product `[[58, 64], [139, 154]]`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the standard triple-nested loop over
lists-of-lists, and the corpus's first use of **chained subscripts**
(`a[i][k]`, `b[k][j]`). Deliberately hand-rolled rather than using EML's
`<M>`/`^T` matrix overlays, which transpile to numpy calls the browser
interpreter defers on — keeping this case fully interpreter-modeled and so
covered by the `eml:equiv` execution-truth gate. Pairs with
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/) as the
corpus's second hand-rolled 2D-array case.

Verify it yourself:

```bash
pnpm eml transpile examples/matrix-multiplication/matrix_multiplication.eml   # -> Python
pnpm eml run examples/matrix-multiplication/matrix_multiplication.eml         # -> A, B, and the product
pnpm eml trace examples/matrix-multiplication/matrix_multiplication.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/matrix-multiplication/matrix_multiplication.eml   # -> OK (fixpoint)
```
