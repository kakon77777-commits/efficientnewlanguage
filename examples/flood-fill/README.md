# Flood fill

`flood_fill.eml` is the paint-bucket tool: starting from one cell, spread
into the four orthogonal neighbors for as long as they still hold the
original color. Prints the grid before and after, filling 13 cells from
`(0,2)`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **2D grid traversal**. It is the
same recursive shape as
[`examples/graph-dfs-recursive/`](../graph-dfs-recursive/), but the graph
here is *implicit in the coordinates* rather than stored as an adjacency
dict — neighbors are computed (`row ± 1`, `col ± 1`) instead of looked up.

Two details worth reading:

- **Nothing needs returning.** The grid is mutated in place through
  chained subscript assignment (`replacement => grid[row][col]`), so every
  recursive call's work is visible to its caller by reference — unlike the
  DFS case, where the accumulated order had to be returned and reassigned
  because list `+` rebinds. The counter is returned; the grid is not.
- **Repainting the cell *before* recursing is what terminates the
  program.** It is what stops a neighbor from immediately painting back
  into the cell that just called it.

The bottom two rows are a pocket sealed behind a solid wall, and survive
the fill untouched. That is what shows the algorithm respects boundaries
rather than simply repainting every matching cell in the grid — without a
disconnected region, a completely broken implementation would produce
identical output.

Verify it yourself:

```bash
pnpm eml transpile examples/flood-fill/flood_fill.eml   # -> Python
pnpm eml run examples/flood-fill/flood_fill.eml         # -> grid before, fill count, grid after
pnpm eml trace examples/flood-fill/flood_fill.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/flood-fill/flood_fill.eml   # -> OK (fixpoint)
```
