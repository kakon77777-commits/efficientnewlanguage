# Maze solver (backtracking)

`maze_solver_backtracking.eml` finds a route through a 6x6 maze from the
top-left to the bottom-right, then renders the board with the path marked:

```
*.....
*####.
*#..#.
*#.##.
*#****
***##*
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: backtracking with a genuine **undo**. Step into a
neighbor, mark it, recurse — and if that branch dead-ends, *unmark* it
(`0 => maze[row][col]`) so a later branch can still use the cell. That
unmark is the entire difference from
[`examples/flood-fill/`](../flood-fill/), which marks cells and never
takes a mark back, because it wants to reach everything rather than find a
route.

**It finds *a* path, not the shortest one.** The maze is built so that is
visible in the output rather than merely asserted: trying `down` first
sends the search along the left edge and around the bottom for **13
cells**, while an **11-cell** route straight across the top row and down
the right column was open the whole time. Those unused cells are still
printed as dots, so the shortcut it never took can be read directly off
the rendered board. Breadth-first search
([`examples/graph-bfs-traversal/`](../graph-bfs-traversal/)) would have
found the 11-cell route, because it explores by distance rather than
committing to a direction.

**One EML/Python scoping trap this case ran into and avoids.** `solve`
returns the path rather than appending into a module-level list, because
assigning to a name anywhere in a function body makes that name local for
the *whole* body — so `solution + [x] => solution` inside the function
would shadow the outer list and raise `UnboundLocalError` on the first
read. That is real Python semantics, not an EML quirk; the same trap is
noted in [`examples/tower-of-hanoi/`](../tower-of-hanoi/).

Verify it yourself:

```bash
pnpm eml transpile examples/maze-solver-backtracking/maze_solver_backtracking.eml   # -> Python
pnpm eml run examples/maze-solver-backtracking/maze_solver_backtracking.eml         # -> path length + rendered board
pnpm eml trace examples/maze-solver-backtracking/maze_solver_backtracking.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/maze-solver-backtracking/maze_solver_backtracking.eml   # -> OK (fixpoint)
```
