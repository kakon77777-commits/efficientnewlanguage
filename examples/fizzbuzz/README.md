# Case corpus: a self-authored FizzBuzz

`fizzbuzz.eml` is one of a six-case self-authored batch of deterministic
simulations and pattern generators (see
[`examples/multiplication-table-generator/`](../multiplication-table-generator/),
[`examples/triangle-pattern-printer/`](../triangle-pattern-printer/),
[`examples/simple-calculator/`](../simple-calculator/),
[`examples/rock-paper-scissors-simulator/`](../rock-paper-scissors-simulator/),
and [`examples/dice-roll-tally/`](../dice-roll-tally/) for the other five) —
part of growing the EML case corpus toward AI-native training scale, not a
port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: EML's native inclusive range literal `[1:30]` (not
Python's `range(...)` call syntax — the reverse-transpiler always
normalizes a `range(...)` call back into this same `[a:b]` node, so writing
`range(...)` directly is not round-trip-stable), `%` used as floor-mod in
`if`/`elif`/`else` comparisons, and `str()` for the numeric fallback case.

Verify it yourself:

```bash
pnpm eml transpile examples/fizzbuzz/fizzbuzz.eml   # -> Python
pnpm eml run examples/fizzbuzz/fizzbuzz.eml         # -> 1..30 FizzBuzz output
pnpm eml trace examples/fizzbuzz/fizzbuzz.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/fizzbuzz/fizzbuzz.eml   # -> OK (fixpoint)
```
