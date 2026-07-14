# MVP proof: a real, recognizable program ported to EML

`tic_tac_toe.eml` is a "does EML actually work for something real" test — not
a new-language-feature regression fixture like the other `examples/phaseN-*`
directories, but a demonstration that a genuine, independently-authored small
program can be expressed end to end in EML: transpiled to Python, executed,
and verified against real Python via the interpreter equivalence gate.

**Source**: adapted from [`Python-World/python-mini-projects`](https://github.com/Python-World/python-mini-projects),
`projects/Tic_tac_toe/tic_tac_toe.py` (MIT License, © 2020 Ravishankar
Chavare). The original is interactive (`input()`); this port replaces that
with a fixed, scripted sequence of moves — including one deliberately
invalid move (playing an already-taken square) — so the whole program is
deterministic and can be verified byte-for-byte against a real Python run,
the same way every other example in this repo is.

**What it exercises**: `class` + methods + `self` attribute state (Phase
7e), a list of lists, set literals + set equality for win-detection (Phase
7b), nested subscript reads/writes through an attribute (Phase 7b/7c), a
`for` loop with `break`/`continue` (Phase 7a), `try`/`except`/`raise`
(Phase 7d), and a ternary conditional — effectively the whole Phase 6/7
grammar working together in one recognizable program, not in isolation.

Verify it yourself:

```bash
pnpm eml transpile examples/mvp-tic-tac-toe/tic_tac_toe.eml   # -> Python
pnpm eml run examples/mvp-tic-tac-toe/tic_tac_toe.eml         # -> final board + winner
pnpm eml trace examples/mvp-tic-tac-toe/tic_tac_toe.eml --run # -> eml:equiv ok:true
```
