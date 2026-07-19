# GCD/LCM calculator

`gcd_lcm_calculator.eml` computes the greatest common divisor of two numbers
via the classic iterative Euclidean algorithm, then derives the least common
multiple from the GCD, for three realistic number pairs (e.g. two recurring
events on 48-day and 18-day cycles next line up on their LCM).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two `def`/`return` functions, a `while` loop
implementing the Euclidean algorithm with three simultaneous variable swaps
per iteration (no tuple-unpacking swap — each step is a plain sequence of
`=>` binds), a list of tuple literals iterated with `for pair in pairs:` plus
subscript reads (`pair[0]`, `pair[1]`), `%` (floor-mod) used for the
remainder, and `int(...)` wrapping a `/` division — EML's bare `/` always
emits Python's true division (which returns a `float` even when the
division is exact), so `int((a * b) / shared)` is required to get the
integer LCM back.

Verify it yourself:

```bash
pnpm eml transpile examples/gcd-lcm-calculator/gcd_lcm_calculator.eml   # -> Python
pnpm eml run examples/gcd-lcm-calculator/gcd_lcm_calculator.eml         # -> gcd/lcm lines
pnpm eml trace examples/gcd-lcm-calculator/gcd_lcm_calculator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/gcd-lcm-calculator/gcd_lcm_calculator.eml   # -> OK (fixpoint)
```
