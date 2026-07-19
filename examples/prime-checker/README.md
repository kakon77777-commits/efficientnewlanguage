# Prime checker

`prime_checker.eml` checks primality by trial division (dividing up to
`sqrt(n)`, computed without a square-root call by comparing
`divisor * divisor <= n`) for a handful of sample numbers, then separately
builds the full list of primes up to 30 by looping over an inclusive range
and growing a list.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function with an early `return`
guard clause, a `while` loop with `break`, the `list + [item] => list` idiom
to grow `primes` across iterations (no `.append()`, which is not modeled by
the interpreter), and EML's native inclusive counted-range literal
`[2:30]` (not Python's `range(...)` call, which is not round-trip-stable —
the reverse transpiler always normalizes any `range(...)` call back into
this `[a:b]` form).

Verify it yourself:

```bash
pnpm eml transpile examples/prime-checker/prime_checker.eml   # -> Python
pnpm eml run examples/prime-checker/prime_checker.eml         # -> prime/non-prime verdicts + prime list
pnpm eml trace examples/prime-checker/prime_checker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/prime-checker/prime_checker.eml   # -> OK (fixpoint)
```
