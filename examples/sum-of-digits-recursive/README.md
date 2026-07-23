# Sum of digits (recursive)

`sum_of_digits_recursive.eml` computes the digit sum of five sample numbers
(`4527, 918273, 60, 999999, 7`) via genuine recursion — a `digit_sum`
function that calls itself on the number with its last digit stripped off.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a recursive function combining `%` (last digit) and
`int(n / 10)` (strip the last digit — same floor-division idiom as
[`examples/digit-sum-calculator/`](../digit-sum-calculator/)). This is the
recursive counterpart to `digit-sum-calculator`'s iterative `while`-loop
version, joining
[`examples/factorial-recursive/`](../factorial-recursive/) and
[`examples/power-recursive/`](../power-recursive/) as the corpus's
self-recursion cases.

Verify it yourself:

```bash
pnpm eml transpile examples/sum-of-digits-recursive/sum_of_digits_recursive.eml   # -> Python
pnpm eml run examples/sum-of-digits-recursive/sum_of_digits_recursive.eml         # -> 5 digit-sum lines
pnpm eml trace examples/sum-of-digits-recursive/sum_of_digits_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/sum-of-digits-recursive/sum_of_digits_recursive.eml   # -> OK (fixpoint)
```
