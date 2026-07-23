# Factorial (recursive)

`factorial_recursive.eml` computes `0!` through `10!` via genuine
self-recursion — a `factorial` function that calls itself — rather than an
iterative loop.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a function calling itself. The corpus's other
recursion-shaped candidates —
[`examples/fibonacci-sequence/`](../fibonacci-sequence/),
[`examples/gcd-lcm-calculator/`](../gcd-lcm-calculator/), and
[`examples/armstrong-number-checker/`](../armstrong-number-checker/)'s
`power` helper — all turned out iterative on inspection (their own comments
even say so), so this is the first case in the corpus to actually exercise a
self-call, confirming the interpreter's "names are bound before the first
call" recursion support holds end-to-end (transpile, interpret, and
round-trip all agree).

Verify it yourself:

```bash
pnpm eml transpile examples/factorial-recursive/factorial_recursive.eml   # -> Python
pnpm eml run examples/factorial-recursive/factorial_recursive.eml         # -> 0! through 10!
pnpm eml trace examples/factorial-recursive/factorial_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/factorial-recursive/factorial_recursive.eml   # -> OK (fixpoint)
```
