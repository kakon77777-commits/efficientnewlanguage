# Sudoku solver (4x4)

`sudoku_solver_4x4.eml` solves a 4x4 Sudoku from four clues, then checks
its own answer with an independent validator.

```
Puzzle (0 = empty):     Solved:
1 . . .                 1 3 2 4
. . 3 .                 4 2 3 1
. 4 . .                 2 4 1 3
. . . 2                 3 1 4 2
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: **constraint-satisfaction** backtracking — a
different shape from the corpus's other two backtracking cases:

| Case | What each step must satisfy |
| --- | --- |
| [`n-queens`](../n-queens/) | one rule, against previously placed pieces |
| [`maze-solver-backtracking`](../maze-solver-backtracking/) | four fixed directions from the current cell |
| this case | **three simultaneous** constraints: row, column, and 2x2 box |

The box test is the one that is easy to get wrong, because it needs the
cell rounded down to its box corner (`int(row / 2) * 2`) rather than the
cell's own coordinates.

**The output is checked by an independent validator, not by trusting the
solver.** Every row, column, and 2x2 box must contain 1, 2, 3, 4. That
matters because a solver ignoring the box rule entirely would still fill
every cell and still satisfy rows and columns — producing a complete,
plausible, *invalid* grid that "it finished" would never catch.

Worth noting what that validator replaced: an earlier version of this case
only checked that each row summed to 10 — which `1+1+4+4` also does. The
sum check would have passed on grids with repeated digits. It was a test
that could not fail for the reason it existed.

Verify it yourself:

```bash
pnpm eml transpile examples/sudoku-solver-4x4/sudoku_solver_4x4.eml   # -> Python
pnpm eml run examples/sudoku-solver-4x4/sudoku_solver_4x4.eml         # -> puzzle, solution, validator verdict
pnpm eml trace examples/sudoku-solver-4x4/sudoku_solver_4x4.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/sudoku-solver-4x4/sudoku_solver_4x4.eml   # -> OK (fixpoint)
```
