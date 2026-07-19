# Matrix transpose (manual)

`matrix_transpose_manual.eml` transposes a small 2x3 matrix, represented as
a plain list of lists, via nested loops and manual index bookkeeping — one
of a seven-case self-authored batch of list/collection utilities for the
EML case corpus (see
[`examples/list-statistics/`](../list-statistics/),
[`examples/duplicate-remover/`](../duplicate-remover/),
[`examples/list-rotator/`](../list-rotator/),
[`examples/intersection-union-finder/`](../intersection-union-finder/),
[`examples/second-largest-finder/`](../second-largest-finder/), and
[`examples/shopping-cart-total/`](../shopping-cart-total/) for the other
six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: plain Python-style nested lists (not EML's `<M>`/`^T`
matrix overlay), nested `for` loops with a double subscript read
(`matrix[i][j]`), list growth via `+` to build each new row (no
`.append()`), and EML's native `[a:b]` counted-range literal for the loop
bounds (`[0:cols-1]`, `[0:rows-1]`) rather than a `range(...)` call — using
`range(...)` directly would still transpile and run correctly, but the
reverse transpiler always normalizes it back to the `[a:b]` form, so writing
it as a bare call breaks round-trip stability (`python1 != python2`).

Verify it yourself:

```bash
pnpm eml transpile examples/matrix-transpose-manual/matrix_transpose_manual.eml   # -> Python
pnpm eml run examples/matrix-transpose-manual/matrix_transpose_manual.eml         # -> original + transposed matrix
pnpm eml trace examples/matrix-transpose-manual/matrix_transpose_manual.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/matrix-transpose-manual/matrix_transpose_manual.eml   # -> OK (fixpoint)
```
