# Armstrong number checker

`armstrong_number_checker.eml` checks whether each of four sample numbers
(153, 370, 9474 — all genuine Armstrong numbers — and 123, which is not) is
an Armstrong number: the sum of its digits, each raised to the power of the
digit count, equals the number itself.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: digit extraction via `%` (floor-mod) and `int(n / 10)`
integer division in a `while` loop (EML's bare `/` always emits Python's
true division, so `int(...)` is needed to keep the running remainder an
integer), and a hand-written `power(base, exponent)` helper function used
instead of EML's own `^` power operator — the language's power operator
(`i^<number>`) only accepts a *literal* numeric exponent, not a variable one,
so a digit count that varies between 3 and 4 across samples cannot be
written as `digit^num_digits`; the helper multiplies in a loop instead.

Verify it yourself:

```bash
pnpm eml transpile examples/armstrong-number-checker/armstrong_number_checker.eml   # -> Python
pnpm eml run examples/armstrong-number-checker/armstrong_number_checker.eml         # -> True/False per sample
pnpm eml trace examples/armstrong-number-checker/armstrong_number_checker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/armstrong-number-checker/armstrong_number_checker.eml   # -> OK (fixpoint)
```
