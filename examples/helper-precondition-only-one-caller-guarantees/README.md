# The precondition only one caller guarantees — a share of 6.0

`helper_precondition_only_one_caller_guarantees.eml` runs one helper —
`max(xs) / sum(xs)` — over two callers' input sets and counts the answers that
land outside the range its name implies.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the helper was written for basket counts, where every
entry is a non-negative count and the answer is always a share between 0 and 1.
That bound is real — and it is a consequence of the **caller**, not of the
helper. Nothing inside the helper checks it, because from inside there was
never anything to check.

```
the same helper, over each caller's inputs
  basket counts   : answers outside 0..1 = 0 of 6
  adjustment rows : answers outside 0..1 = 3 of 6

witness from the second caller
  xs     = [10, -12, 8]
  max    = 10
  sum    = 6
  share  = 1.6666666666666667
```

The precondition nobody wrote down:

```
the precondition the helper never states: every entry >= 0
  basket inputs violating it     : 0 of 6
  adjustment inputs violating it : 6 of 6
```

**Why its test suite cannot fail on this:**

```
the helper's fixtures, drawn from the only caller that existed when it was written
  fixtures producing an out-of-range answer: 0
  a test suite built from those inputs cannot fail on this
```

Where the impossible shares come from:

```
  [10, -12, 8]  max 10 over sum 6 -> 1.6666666666666667
  [5, -5, 3]  max 5 over sum 3 -> 1.6666666666666667
  [6, -2, -3]  max 6 over sum 1 -> 6.0
```

When entries can cancel, the denominator stops being *the total these parts add
up to*. The arithmetic is unchanged and still correct as arithmetic. What
changed is that its result no longer denotes a share.

Verify it yourself:

```bash
pnpm eml run examples/helper-precondition-only-one-caller-guarantees/helper_precondition_only_one_caller_guarantees.eml
```
