# Power (recursive)

`power_recursive.eml` computes `base^exponent` for five sample pairs
(`2^10, 3^4, 5^0, 7^3, 10^6`) via genuine recursion — a `power` function
that calls itself, decrementing the exponent each time.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a recursive function with a tuple-unpacking loop
(`for pair in pairs: pair[0] => base`). This is the recursive counterpart to
[`examples/armstrong-number-checker/`](../armstrong-number-checker/)'s
iterative `power` helper — EML's `^` power operator only accepts a literal
exponent, not a variable one, so a variable exponent has to be hand-rolled,
here via genuine self-recursion (see also
[`examples/factorial-recursive/`](../factorial-recursive/), the corpus's
other real recursion case).

Verify it yourself:

```bash
pnpm eml transpile examples/power-recursive/power_recursive.eml   # -> Python
pnpm eml run examples/power-recursive/power_recursive.eml         # -> 5 power lines
pnpm eml trace examples/power-recursive/power_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/power-recursive/power_recursive.eml   # -> OK (fixpoint)
```
