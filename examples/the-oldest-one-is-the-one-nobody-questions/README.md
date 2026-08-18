# The oldest one is the one nobody questions

`the_oldest_one_is_the_one_nobody_questions.eml` - The older a workaround is, the more likely its condition is gone and the less likely anyone looks at it. Both halves are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Not looking at old code is a reasonable prior. Old code has survived, it is not what changed last week, and the thing that broke this morning is almost always something recent. Attention going to the new is how debugging works and it is right.

Applied to removal it points the wrong way. A workaround is removable when the condition it was written for stopped happening, and that becomes more likely as time passes. Review attention becomes less likely over the same time, so the two curves cross and never come back.

Both are measured against the same list.

```
workarounds : 14
```

```
age band              count   condition gone   reviews last year
  under a year   4       1 of 4           9
  one to three years   4       3 of 4           4
  over three years   6       5 of 6           0
```

```
the two ends of the list
  under a year     : 1 of 4 gone, 9 reviews
  over three years : 5 of 6 gone, 0 reviews
  the older group is likelier to be removable
  and it is looked at less, by 9 reviews
```

```
a review sweep of 5 entries, newest first
  removable found : 1 of 5
```

```
the same sweep, oldest first
  removable found : 4 of 5
  3 more, from the same amount of reading
```

```
old entries whose condition still occurs
  w11 : 51 months old and still firing
  so the sweep reads them, it does not delete them
```

```
removable right now : 9 of 14
  of those, never reviewed in the last year : 5
  they will still be here next year, for the same reason they are here now
```

```
control - a list where removability does not track age
  newest two : 1 removable, oldest two : 1 removable
  the same, so ordering by age would buy nothing here
```

Spending attention on what changed recently is how anything gets debugged. Removability accumulates in the other direction, so the two orders are opposite and only one of them is anybody's habit.

Verify it yourself:

```bash
pnpm eml run examples/the-oldest-one-is-the-one-nobody-questions/the_oldest_one_is_the_one_nobody_questions.eml
```
