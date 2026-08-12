# Two off-by-ones preserve the count — so the length check goes quiet

`two_off_by_ones_preserve_the_count.eml` slides a window whose start is one late
and whose end is one late, and reports what a length check can see.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: either off-by-one alone changes the window's length, so
the length check finds it immediately. Both together restore the length exactly:

```
windows whose length is not 4
  correct : 0 of 8
  start late : 8 of 8
  end late : 8 of 8
  both late : 0 of 8
  states a length check accepts: 2 of 4

windows whose CONTENTS differ from the correct window (varied data)
  correct : 0 of 8
  start late : 8 of 8
  end late : 8 of 8
  both late : 8 of 8
  states that are actually correct: 1 of 4
```

The check accepts 2 states; 1 is correct. Every window it accepts in the other
state is wrong:

```
first window where both-late differs
  at index  : 0
  correct   : [3, 1, 4, 1]  sum 9
  both late : [1, 4, 1, 5]  sum 11
```

**A stronger check is not enough either, and the fixture decides how much
weaker it gets:**

```
windows whose SUM differs from the correct window
  correct : varied 0 of 8, flat 0 of 8
  start late : varied 8 of 8, flat 8 of 8
  end late : varied 8 of 8, flat 8 of 8
  both late : varied 7 of 8, flat 0 of 8
```

Two things worth reading carefully there. On a **flat** fixture a sum check
catches the both-late state **0 of 8 times** — a shifted window over constant
values sums the same. And even on varied data it is **7 of 8**, not 8: one
window's sum coincides by accident. Neither number was chosen; both fall out of
the data.

Nothing in the program declares which states pass. Every window is built and
compared element by element.

**Why it sits next to
[two-defects-cancel-in-the-round-trip](../two-defects-cancel-in-the-round-trip/).**
That case is a fix that must be applied whole or not at all. This one is its
mirror: a defect that must be present twice to hide. Both come from the same
place — a pair of edits made by the same hand, on the same day, from the same
misreading — which is why compensating defects are more common than the
arithmetic of "two independent bugs" suggests.

Verify it yourself:

```bash
pnpm eml run examples/two-off-by-ones-preserve-the-count/two_off_by_ones_preserve_the_count.eml
```
