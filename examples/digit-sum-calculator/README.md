# Digit sum + digital root calculator

`digit_sum_calculator.eml` takes a small list of sample integers and, for
each one, computes its digit sum (the sum of its base-10 digits) and its
"digital root" — the single digit left after repeatedly re-summing digits
until only one remains.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: digit extraction via `%` (floor-mod, for the last
digit) paired with `int(n / 10)` (EML has no `//` floor-division token, so
truncating a true-division result stands in for it on these non-negative
inputs) inside a `while` loop; a second, nested `while` loop that repeats
the same reduction until the running total is a single digit (the digital
root); and the `^+` declare-vs-augment sigil used twice per accumulator —
once outside the reduction loop to (re)declare/reset it fresh on every
outer iteration, once inside it to augment — the same idiom
word-frequency-counter's `counts[word]` tally relies on, just with a bare
identifier instead of a subscript target.

Verify it yourself:

```bash
pnpm eml transpile examples/digit-sum-calculator/digit_sum_calculator.eml   # -> Python
pnpm eml run examples/digit-sum-calculator/digit_sum_calculator.eml         # -> digit sums + digital roots
pnpm eml trace examples/digit-sum-calculator/digit_sum_calculator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/digit-sum-calculator/digit_sum_calculator.eml   # -> OK (fixpoint)
```
