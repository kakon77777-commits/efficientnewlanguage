# Conway's Game of Life

`conway_game_of_life.eml` evolves a glider on a 6x6 grid for four
generations, printing every generation.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **cellular automaton**, and its
first case that requires **double buffering**. Every cell in a generation
reads the *previous* generation, so writing results back into the grid
being read would let earlier updates corrupt later neighbor counts.
`step` therefore builds and returns a brand-new grid — the deliberate
opposite of [`examples/flood-fill/`](../flood-fill/), which mutates its
grid in place because there the propagation *is* the algorithm.

The pattern is a glider because it is **self-checking**. A glider has
period 4: after four generations it returns to its exact original shape,
displaced one cell down and one cell right.

```
Generation 0        Generation 4
.#....              ......
..#...              ..#...
###...              ...#..
......              .###..
```

Same shape, moved diagonally, still 5 cells alive. If any of the three
survival/birth rules were subtly wrong the pattern would decay to nothing
or freeze into a static block instead — a failure far more visible than a
wrong number, which is exactly why this pattern is worth more here than a
random soup would be.

Neighbor offsets are generated as `[0:2]` minus 1 rather than a literal
`[-1:1]` range, and bounds are checked per neighbor so edge cells simply
see fewer neighbors (no wrap-around).

Verify it yourself:

```bash
pnpm eml transpile examples/conway-game-of-life/conway_game_of_life.eml   # -> Python
pnpm eml run examples/conway-game-of-life/conway_game_of_life.eml         # -> 5 generations + alive count
pnpm eml trace examples/conway-game-of-life/conway_game_of_life.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/conway-game-of-life/conway_game_of_life.eml   # -> OK (fixpoint)
```
