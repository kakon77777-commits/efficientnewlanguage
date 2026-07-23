# Pascal's triangle

`pascals_triangle.eml` generates the first 8 rows of Pascal's triangle,
each row built from the previous one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` helper (`next_row`) called
repeatedly to grow a list-of-lists, an expression-bound inclusive range
whose start can exceed its end (`[1 : n - 1]` when `n == 1`, which correctly
runs zero iterations rather than erroring), and list growth via
`row + [value] => row` (no `.append()`, not modeled).

Verify it yourself:

```bash
pnpm eml transpile examples/pascals-triangle/pascals_triangle.eml   # -> Python
pnpm eml run examples/pascals-triangle/pascals_triangle.eml         # -> 8 triangle rows
pnpm eml trace examples/pascals-triangle/pascals_triangle.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/pascals-triangle/pascals_triangle.eml   # -> OK (fixpoint)
```
