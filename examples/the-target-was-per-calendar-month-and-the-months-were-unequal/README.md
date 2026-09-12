# The target was per calendar month and the months were unequal

`the_target_was_per_calendar_month_and_the_months_were_unequal.eml` - The team hit its monthly target in July and missed it in February, and both counts are right. What the target is denominated in is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The target is measured honestly. It counts real completed units, not estimates; the same definition of a unit is used every month; nothing is pulled forward or pushed back across the boundary; and the month boundary is the calendar's.

The target is a fixed number per calendar month, and the months are unequal.

```
target per calendar month       : 300000
steady output per day           : 10000
```

```
february (28 days) total        : 280000
  against target                : -20000
july (31 days) total            : 310000
  against target                : 10000
```

```
daily rate needed in february   : 10714
daily rate needed in july       : 9677
```

```
the monthly count
  counts : real completed units, not estimates
  a unit : the same definition every month
  pulled across the boundary : nothing
  boundary : the calendar's
  months counted correctly : both
  verdict : MET IN JULY, MISSED IN FEBRUARY
```

```
  refusing to pull units across the month boundary is the
  part done right here, and it is why each month's count
  is clean
```

```
the target per month
  what it is : one fixed number, every month
  what a month is : 28 to 31 days, not a fixed span
  so the daily rate it demands : varies by 1037
    between the shortest and longest month
  a steady 10000 a day : clears the bar in a long month
  the same rate in february : falls short by 20000
```

```
the month-over-month report
  july : 310000, over target
  february : 280000, under target
  the story it tells : the team slipped in february
  what actually changed in the work : nothing; 10000 a
    day throughout
  what changed : the number of days the target was spread
    over
```

```
null control - a per-day target, not a per-month one
  february total : 280000
  february target at 10000 a day : 280000
  months that look like a change : 
    0
  no unit and no count changed; the target stopped being a
  fixed monthly number and started scaling with the days
```

```
what a monthly target guarantees
  the month's count reached the number : exactly, real
    units, one definition, nothing shifted across the
    boundary
  the team's output changed month to month : not
    addressed; the target is per calendar month and the
    months are unequal, so a steady 10000 a day misses a
    28-day month and beats a 31-day one with the work
    unchanged
```

```
a rate compared to a fixed monthly number is compared to a moving bar, because
a month is a variable amount of time; meeting it or missing it can be a fact
about the calendar and none about the work
```

Each month counts real units, one definition, nothing shifted - both counts are right. The target is a fixed 300000 per calendar month and the months are unequal, so a steady 10000 a day beats july by 10000 and misses february by 20000, with 0 real change in the work.

Verify it yourself:

```bash
pnpm eml run examples/the-target-was-per-calendar-month-and-the-months-were-unequal/the_target_was_per_calendar_month_and_the_months_were_unequal.eml
```
