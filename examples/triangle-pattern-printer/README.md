# Case corpus: a self-authored triangle pattern printer

`triangle_pattern_printer.eml` is one of a six-case self-authored batch of
deterministic simulations and pattern generators (see
[`examples/fizzbuzz/`](../fizzbuzz/),
[`examples/multiplication-table-generator/`](../multiplication-table-generator/),
[`examples/simple-calculator/`](../simple-calculator/),
[`examples/rock-paper-scissors-simulator/`](../rock-paper-scissors-simulator/),
and [`examples/dice-roll-tally/`](../dice-roll-tally/) for the other five) —
part of growing the EML case corpus toward AI-native training scale, not a
port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nested `for` loops over EML's native `[a:b]` range
literal, where the inner loop's upper bound is the outer loop variable
itself (`[1:row]`, a bare identifier bound rather than a literal), and
string concatenation (`line + "*"`) to build each row of a 5-row
triangular asterisk pattern before a single `^0` print per row.

Verify it yourself:

```bash
pnpm eml transpile examples/triangle-pattern-printer/triangle_pattern_printer.eml   # -> Python
pnpm eml run examples/triangle-pattern-printer/triangle_pattern_printer.eml         # -> 5-row asterisk triangle
pnpm eml trace examples/triangle-pattern-printer/triangle_pattern_printer.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/triangle-pattern-printer/triangle_pattern_printer.eml   # -> OK (fixpoint)
```
