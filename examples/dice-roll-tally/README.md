# Case corpus: a self-authored dice roll tally

`dice_roll_tally.eml` is one of a six-case self-authored batch of
deterministic simulations and pattern generators (see
[`examples/fizzbuzz/`](../fizzbuzz/),
[`examples/multiplication-table-generator/`](../multiplication-table-generator/),
[`examples/triangle-pattern-printer/`](../triangle-pattern-printer/),
[`examples/simple-calculator/`](../simple-calculator/), and
[`examples/rock-paper-scissors-simulator/`](../rock-paper-scissors-simulator/)
for the other five) — part of growing the EML case corpus toward AI-native
training scale, not a port of an existing project. EML's interpreter models
no random-number generation, so the dice rolls here are a fixed, hardcoded
20-value list, not real randomness.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict literal pre-seeded with all six faces
(`tally^+{1: 0, ..., 6: 0}`), dict subscript read/write via `=>`
(`tally[roll] + 1 => tally[roll]`, matching the pattern in
[`examples/word-frequency-counter/`](../word-frequency-counter/)), the
`EXPR^0(END_EXPR)` custom print terminator to print a face and its count on
one line without an intermediate newline, and a manual max-of-comparisons
loop over `[1:6]` to find the most-frequent face (deliberately avoiding a
`sorted()`/`max()`-of-tuples builtin the interpreter doesn't model).

Verify it yourself:

```bash
pnpm eml transpile examples/dice-roll-tally/dice_roll_tally.eml   # -> Python
pnpm eml run examples/dice-roll-tally/dice_roll_tally.eml         # -> per-face tally + most-frequent face
pnpm eml trace examples/dice-roll-tally/dice_roll_tally.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/dice-roll-tally/dice_roll_tally.eml   # -> OK (fixpoint)
```
