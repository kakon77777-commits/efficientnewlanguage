# Perfect number checker

`perfect_number_checker.eml` checks whether six sample numbers
(`6, 28, 12, 496, 100, 8128`) are perfect numbers — numbers whose proper
divisors sum back to the number itself — via trial division. `6`, `28`,
`496`, and `8128` are the first four perfect numbers; `12` and `100` are
not.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with a `for` loop over an
expression-bound range (`[1 : n - 1]`) and `%` to accumulate the proper
divisor sum — no external number-theory library.

Verify it yourself:

```bash
pnpm eml transpile examples/perfect-number-checker/perfect_number_checker.eml   # -> Python
pnpm eml run examples/perfect-number-checker/perfect_number_checker.eml         # -> True/False lines
pnpm eml trace examples/perfect-number-checker/perfect_number_checker.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/perfect-number-checker/perfect_number_checker.eml   # -> OK (fixpoint)
```
