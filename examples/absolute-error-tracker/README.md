# Absolute error tracker

`absolute_error_tracker.eml` compares five readings against a target and
reports which ones fall outside a tolerance band.

It is really a program about `abs()`: when you are asking "how far off was
this?", the sign is noise and the magnitude is the entire answer.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `abs()` over ints, floats and bools, plus the
symmetry that makes it worth having — a reading 1.7 high and one 1.7 low
are equally wrong, and `abs()` says so in one expression.

```
Passing: 3 of 5
Worst deviation: 1.9000000000000004 at index 4
Symmetry: abs(-1.7) == abs(1.7) is True
abs(True) is 1, not a bool
```

Two details are load-bearing rather than decorative:

- The deviations print as `0.1999999999999993`, not `0.2`. That is what
  binary floating point actually holds, and CPython prints the same thing.
  Rounding it for display would have hidden a real property of the data.
- `abs(True)` is `1`, an **int**. `bool` is a subclass of `int` in Python,
  which is the same rule that makes `True + True == 2`.

## Why this case exists

`abs()` had been implemented since the first interpreter and was called by
**zero** of the 149 corpus programs before this one.

That was not bad luck with one builtin. Measuring the corpus by *builtin*
rather than by syntax construct found five at zero — `abs`, `float`, `min`,
`set`, `sum` — and every other one was only ever called with a single
argument. Probing those unexercised shapes against real CPython turned up
twelve divergences.

The general lesson is the one `%`-formatting taught earlier: coverage of a
**name** proves nothing. `str` appeared in 130 programs and was correct;
`float` appeared in none and was wrong five different ways.

Verify it yourself:

```bash
pnpm eml run examples/absolute-error-tracker/absolute_error_tracker.eml
pnpm eml trace examples/absolute-error-tracker/absolute_error_tracker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/absolute-error-tracker/absolute_error_tracker.eml   # -> OK (fixpoint)
```
