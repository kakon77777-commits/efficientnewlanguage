# Day of week (Zeller's congruence)

`day_of_week_zeller.eml` computes which weekday a calendar date falls on,
arithmetically, with no date library — and checks all five results against
independently known answers.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first calendar computation, and a
formula whose oddest feature is load-bearing rather than a transcription
slip: **January and February are treated as months 13 and 14 of the
previous year**. That shift moves the leap day to the end of the year, so
the century terms stay correct without any special case for February 29.
The `2024-02-29` sample exists to exercise exactly that path.

Every date is paired with a weekday that is independently known, so the
case fails loudly instead of confidently reporting a wrong day:

| Date | Known as | Weekday |
| --- | --- | --- |
| 2000-01-01 | start of the millennium | Saturday |
| 1970-01-01 | the Unix epoch | Thursday |
| 1969-07-20 | the moon landing | Sunday |
| 2024-02-29 | a leap day | Thursday |
| 1900-01-01 | start of the 20th century | Monday |

A self-consistent but wrong implementation would still print five
confident weekday names; the `5 of 5` summary line is what makes that
distinguishable at a glance.

Note the weekday table starts at Saturday — that is Zeller's own
convention (`h = 0` is Saturday), not an off-by-one.

Verify it yourself:

```bash
pnpm eml transpile examples/day-of-week-zeller/day_of_week_zeller.eml   # -> Python
pnpm eml run examples/day-of-week-zeller/day_of_week_zeller.eml         # -> 5 dated lines + a 5-of-5 summary
pnpm eml trace examples/day-of-week-zeller/day_of_week_zeller.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/day-of-week-zeller/day_of_week_zeller.eml   # -> OK (fixpoint)
```
