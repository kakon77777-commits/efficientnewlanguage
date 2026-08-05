# Week numbering conventions — "week 1" is at least three weeks

`week_numbering_conventions.eml` sweeps a year day by day under ISO,
"simple" (week 1 starts 1 January) and US (weeks start Sunday) numbering,
and checks the properties a week number needs to work as a grouping key.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the conventions agree through the middle of the year
and part at both ends — which is exactly where an annual report is read.

The sweep verifies each scheme partitions the year (every day gets exactly
one bucket; the bucket sizes sum back to 365), and then measures where they
differ. The simple scheme produces a **53rd bucket** because 365 is not a
multiple of 7. ISO can assign a day to a different **year** than the day
belongs to, which is the part that surprises a filter written as
`year = 2026`.

```
revenue booked on 2026-12-31, grouped by week:
  ISO:    2026 week 53
  simple: 2026 week 53
  ...both keep it inside 2026 this year, which is not true every year.
```

That last line is deliberate: 2026 happens to be a year where the two
agree, and the program says so rather than presenting a convenient year as
if it were the general case.

The weekday anchor is checked against a stated fact — 2026-01-01 is a
Thursday — so the whole sweep rests on something independent of the code
that produces it.

Verify it yourself:

```bash
pnpm eml run examples/week-numbering-conventions/week_numbering_conventions.eml
```

```bash
pnpm eml trace examples/week-numbering-conventions/week_numbering_conventions.eml --run
```
