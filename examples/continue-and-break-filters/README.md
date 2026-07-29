# `continue` and `break` are not symmetric

`continue_and_break_filters.eml` pins the interaction of the two loop
escapes — used by two and nine corpus programs respectively, and never
examined together.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

```
continue  skips the rest of THIS iteration and goes to the next
break     abandons the loop entirely
```

**1. Filtering a log** with both:

```
  seen 7 of 8 lines, accepted 3, skipped 3
  The last line was never seen: STOP broke out before it.
```

**2. The `while` trap.** `continue` jumps straight back to the condition,
skipping anything written at the *bottom* of the body — including the
increment. That is an infinite loop. The case increments **first** and a
step counter proves termination:

```
  incrementing FIRST: 12 iterations, 8 kept, terminated
  Had the increment sat after the `continue`, i would stay at 3 forever.
```

**3. `break` leaves only the inner loop.** There is no labelled break in
EML (nor in Python), so escaping both takes a flag — and the visit counts
show which iterations actually ran:

```
  plain break:   3 rows entered, 8 cells visited
  flag + break:  2 rows entered, 5 cells visited
```

All three rows run under a plain `break`; it only ended row 2's inner
loop. Counting is what makes that visible — the printed output alone
would look the same either way.

Verify it yourself:

```bash
pnpm eml transpile examples/continue-and-break-filters/continue_and_break_filters.eml
pnpm eml run examples/continue-and-break-filters/continue_and_break_filters.eml
pnpm eml trace examples/continue-and-break-filters/continue_and_break_filters.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/continue-and-break-filters/continue_and_break_filters.eml   # -> OK (fixpoint)
```
