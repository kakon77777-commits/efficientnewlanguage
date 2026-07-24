# Collatz steps (recursive)

`collatz_recursive.eml` counts the number of Collatz-conjecture steps
needed to reach `1`, for four sample starting numbers (`6, 11, 27, 1`).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: genuine self-recursion returning just a step count,
a deliberate contrast with the corpus's existing
[`examples/collatz-sequence/`](../collatz-sequence/), which is iterative
and returns the full sequence rather than a count. `27` is the classic
short-input, long-sequence example (111 steps) — included to confirm the
recursion genuinely handles real depth, not just a toy case, and that both
the interpreter and the round-trip fixpoint hold at that depth.

Verify it yourself:

```bash
pnpm eml transpile examples/collatz-recursive/collatz_recursive.eml   # -> Python
pnpm eml run examples/collatz-recursive/collatz_recursive.eml         # -> 4 "reaches 1 in N steps" lines
pnpm eml trace examples/collatz-recursive/collatz_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/collatz-recursive/collatz_recursive.eml   # -> OK (fixpoint)
```
