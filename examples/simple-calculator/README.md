# Case corpus: a self-authored simple calculator

`simple_calculator.eml` is one of a six-case self-authored batch of
deterministic simulations and pattern generators (see
[`examples/fizzbuzz/`](../fizzbuzz/),
[`examples/multiplication-table-generator/`](../multiplication-table-generator/),
[`examples/triangle-pattern-printer/`](../triangle-pattern-printer/),
[`examples/rock-paper-scissors-simulator/`](../rock-paper-scissors-simulator/),
and [`examples/dice-roll-tally/`](../dice-roll-tally/) for the other five) —
part of growing the EML case corpus toward AI-native training scale, not a
port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a fixed list of `(a, operator, b)` sample tuples,
tuple-subscript reads (`calc[0]`, `calc[1]`, `calc[2]`), `if`/`elif`/`else`
dispatch on an operator string, and `try`/`except ZeroDivisionError` to
gracefully report a division-by-zero case (`5 / 0`) instead of crashing,
alongside the four normal arithmetic operations.

Verify it yourself:

```bash
pnpm eml transpile examples/simple-calculator/simple_calculator.eml   # -> Python
pnpm eml run examples/simple-calculator/simple_calculator.eml         # -> 5 computed results
pnpm eml trace examples/simple-calculator/simple_calculator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/simple-calculator/simple_calculator.eml   # -> OK (fixpoint)
```
