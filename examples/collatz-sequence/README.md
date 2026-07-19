# Collatz sequence

`collatz_sequence.eml` runs the Collatz conjecture step (halve if even,
`3n + 1` if odd) from three starting numbers — 6, 11, and the famously
long-running 27 (111 steps) — until each reaches 1, printing the full
sequence and step count for every run.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with a `while` loop and an
`if`/`else` branch on parity (`n % 2 == 0`), the `list + [item] => list`
growth idiom to accumulate the full sequence, `int(n / 2)` for the even
branch — EML's bare `/` always emits Python's true division (`float`
result), so `int(...)` is required to keep the sequence values as integers —
and deriving the step count after the fact from `len(seq) - 1` rather than
tracking a second counter through the loop.

Verify it yourself:

```bash
pnpm eml transpile examples/collatz-sequence/collatz_sequence.eml   # -> Python
pnpm eml run examples/collatz-sequence/collatz_sequence.eml         # -> sequence + step count per start
pnpm eml trace examples/collatz-sequence/collatz_sequence.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/collatz-sequence/collatz_sequence.eml   # -> OK (fixpoint)
```
