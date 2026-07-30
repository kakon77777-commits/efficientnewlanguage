# `sum()` is less boring than it looks

`running_total_sum.eml` exercises the three behaviours of `sum()` that
matter and are easy to get wrong.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**:

1. **The second argument is a START value.** `sum(xs, 100)` is an opening
   balance, not a step or a limit.
2. **Float addition is compensated.** CPython's `sum()` carries a running
   correction term, so it is not the same as adding left to right.
3. **Strings are refused on purpose.** `sum()` raises rather than
   concatenating, to steer you to `''.join()` — which is linear where
   repeated concatenation is quadratic.

```
  sum(daily, 100)     = 208   <- 100 is an OPENING BALANCE
  sum([])             = 0     <- the empty sum is 0, not an error
  0.1 + 0.2 + 0.3 by hand = 0.6000000000000001
  sum([0.1, 0.2, 0.3])    = 0.6
  identical? False
  sum() can't sum strings [use ''.join(seq) instead]
```

That `identical? False` line is the interesting one. The same three
numbers added two ways give two different doubles, and `sum()` gives the
better one. The compensation is not a rounding-for-display trick — it is a
different arithmetic result.

## Why this case exists

`sum()` was called by **zero** of the 149 corpus programs before this one.

The float behaviour was already right, because EML's `Σ` operator routes
through the same compensated addition and the corpus does exercise `Σ`.
But the builtin's own argument shapes were not covered at all, and two
were wrong: summing a **tuple** raised TypeError where Python answers, and
summing **strings** happily returned `"ab"` where Python refuses.

A third problem lived in the other direction entirely. The reverse
transpiler special-cased `sum(` as EML's `Σ` and *required* a generator
expression after it, so **any ordinary `sum()` call failed to reverse-parse**
with `Expected 'for'`. It now decides by looking ahead for a top-level
`for` instead of assuming. A program using both forms in one expression
round-trips correctly.

Verify it yourself:

```bash
pnpm eml run examples/running-total-sum/running_total_sum.eml
pnpm eml trace examples/running-total-sum/running_total_sum.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/running-total-sum/running_total_sum.eml   # -> OK (fixpoint)
```
