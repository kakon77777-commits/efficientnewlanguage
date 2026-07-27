# Days between dates

`days_between_dates.eml` counts the days between two calendar dates by
converting each to a day number since a fixed epoch and subtracting.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the **full** Gregorian leap rule, which is three
rules rather than one — divisible by 4 is a leap year, *except* divisible
by 100 is not, *except* divisible by 400 is after all.

The samples exercise each branch separately, because an implementation
knowing only the first rule still gets most dates right and fails
silently on the rest:

| Span | Days | Branch |
| --- | --- | --- |
| 2023-02-28 → 2023-03-01 | 1 | ordinary year, no 29th |
| 2024-02-28 → 2024-03-01 | 2 | divisible by 4: leap |
| **1900**-02-28 → 1900-03-01 | **1** | divisible by 100: **not** leap |
| **2000**-02-28 → 2000-03-01 | **2** | divisible by 400: leap after all |
| 2000-01-01 → 2000-12-31 | 365 | a full leap year, Jan 1 to Dec 31 |
| 1999-12-31 → 2000-01-01 | 1 | across a year boundary |

**The 1900/2000 pair is the one that matters.** Those two spans are
identical in every respect except the century rule, so a naive
"divisible by 4" implementation returns 2 for 1900 while every other
sample still passes — the failure would be invisible without that row.

Companion to [`examples/day-of-week-zeller/`](../day-of-week-zeller/),
which answers a different question about the same calendar. Zeller's
congruence sidesteps leap years with an algebraic trick (shifting
Jan/Feb into the previous year); this case has to confront them directly,
which is why both are worth having.

The 2000-01-01 → 2000-12-31 span being **365** and not 366 is also
deliberate: a leap year has 366 days, but the gap between its first and
last day is one less than that.

Verify it yourself:

```bash
pnpm eml transpile examples/days-between-dates/days_between_dates.eml   # -> Python
pnpm eml run examples/days-between-dates/days_between_dates.eml         # -> 6 spans + a 6-of-6 summary
pnpm eml trace examples/days-between-dates/days_between_dates.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/days-between-dates/days_between_dates.eml   # -> OK (fixpoint)
```
