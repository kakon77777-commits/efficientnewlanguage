# Case corpus: a self-authored rock-paper-scissors simulator

`rock_paper_scissors_simulator.eml` is one of a six-case self-authored
batch of deterministic simulations and pattern generators (see
[`examples/fizzbuzz/`](../fizzbuzz/),
[`examples/multiplication-table-generator/`](../multiplication-table-generator/),
[`examples/triangle-pattern-printer/`](../triangle-pattern-printer/),
[`examples/simple-calculator/`](../simple-calculator/), and
[`examples/dice-roll-tally/`](../dice-roll-tally/) for the other five) —
part of growing the EML case corpus toward AI-native training scale, not a
port of an existing project. EML's interpreter models no random-number
generation, so the "simulation" here is a fixed, hardcoded sequence of six
rounds, not real randomness.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a fixed list of `(player_one, player_two)` move
tuples, tuple-subscript reads, `if`/`elif`/`else` winner logic combining
`and`/`or` across parenthesized sub-conditions, and the declare-or-augment
`^+` sigil used for a running score tally — `player_one_score^+0` declares
the variable once before the loop, and the later `player_one_score^+1`
inside the loop body resolves to an augmented `+= 1` (rather than a
re-declaration) because the name is already in scope by that point.

Verify it yourself:

```bash
pnpm eml transpile examples/rock-paper-scissors-simulator/rock_paper_scissors_simulator.eml   # -> Python
pnpm eml run examples/rock-paper-scissors-simulator/rock_paper_scissors_simulator.eml         # -> 6 round results + final score
pnpm eml trace examples/rock-paper-scissors-simulator/rock_paper_scissors_simulator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/rock-paper-scissors-simulator/rock_paper_scissors_simulator.eml   # -> OK (fixpoint)
```
