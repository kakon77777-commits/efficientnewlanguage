# Age at a date — three defensible answers on 29 February

`age_at_date_leap_day.eml` computes age four ways and compares them against
a reference table written from the definition rather than from any of the
implementations.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two separate problems that get conflated. The first
has a right answer — age is a **comparison**, not a quotient, and
`days / 365` drifts. The second has no computable answer at all: a person
born 2004-02-29 has no birthday in 2025, so on 28 February 2025 they are
either 20 or 21 depending on a rule nobody wrote down.

```
2025-02-28: march-rule 20, feb-rule 21, exact-rule 20
2025-03-01: march-rule 21, feb-rule 21, exact-rule 21
```

All three are used in real law and real software. The checks pin the part
that *is* decidable — both accommodating rules match the reference table
exactly, the century leap boundaries are right (2000 yes, 1900 no) — and
measure the part that is not: the rules agree in a leap year and disagree
on 28 February in a non-leap year, 3 times across the swept dates.

**On trace size**: `day_number` originally looped over every year since
year 1 on every call, inside two sweeps, which produced a **234 MB**
execution trace for a program whose output is thirty lines. It now uses the
Gregorian closed form `365·py + ⌊py/4⌋ − ⌊py/100⌋ + ⌊py/400⌋`, which is
both smaller (1.3 MB) and closer to the definition of the rule.

Verify it yourself:

```bash
pnpm eml run examples/age-at-date-leap-day/age_at_date_leap_day.eml
```

```bash
pnpm eml trace examples/age-at-date-leap-day/age_at_date_leap_day.eml --run
```
