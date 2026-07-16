# MVP proof: a second real, recognizable program ported to EML

`number_guessing_game.eml` is the second "does EML actually work for
something real" test (see [`examples/mvp-tic-tac-toe/`](../mvp-tic-tac-toe/)
for the first) — a genuine, independently-authored small program expressed
end to end in EML: transpiled to Python, executed, and verified against real
Python via the interpreter equivalence gate.

**Source**: adapted from [`Python-World/python-mini-projects`](https://github.com/Python-World/python-mini-projects),
`projects/Number_guessing_game/main.py` (MIT License). The original draws the
secret number from `random.randint()` and reads guesses via `input()`; this
port fixes both to a deterministic scripted sequence (a mix of genuine
too-low and too-high guesses on both sides of the secret, before the correct
one) so the whole program is verifiable byte-for-byte against a real Python
run, the same way every other example in this repo is.

**What it exercises**: `for`/`break` over a list (Phase 7a), `if`/`elif`/`else`
with values carried out of the branch (Phase 6), an augmented add via the
overlay-assign form (`chances^+1`), and string concatenation with `str()`
conversion of non-string values (`+` on mixed `str`/`int` operands) — a
different, procedural (non-class) shape from the Tic-Tac-Toe port, showing
EML covers both program styles.

Verify it yourself:

```bash
pnpm eml transpile examples/mvp-number-guessing-game/number_guessing_game.eml   # -> Python
pnpm eml run examples/mvp-number-guessing-game/number_guessing_game.eml         # -> guesses + final chances
pnpm eml trace examples/mvp-number-guessing-game/number_guessing_game.eml --run # -> eml:equiv ok:true
```
