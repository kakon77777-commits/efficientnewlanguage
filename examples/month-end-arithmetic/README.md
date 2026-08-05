# Month-end arithmetic — two correct answers to "renew monthly"

`month_end_arithmetic.eml` renews a subscription that started on 31 January
twelve times, two ways: by stepping forward one month at a time, and by
adding *n* months to the original start date.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two implementations of the same English phrase that
agree for eleven months of the year and then diverge permanently.

```
by stepping:   2026-02-28 2026-03-28 2026-04-28 ... 2027-01-28
by start + n:  2026-02-28 2026-03-31 2026-04-30 ... 2027-01-31
```

Stepping clamps to 28 in February and **never recovers** — the subscription
silently moves three days earlier for the rest of its life. Adding to the
start date re-derives from 31 each time and comes back.

Neither is wrong. They answer different questions, and the code that picked
one usually did not know there were two.

The number that explains the invisibility:

```
dates where clamp and overflow differ: 7/365
```

A test suite whose fixture dates fall before the 29th cannot tell the two
rules apart at all.

Verify it yourself:

```bash
pnpm eml run examples/month-end-arithmetic/month_end_arithmetic.eml
```

```bash
pnpm eml trace examples/month-end-arithmetic/month_end_arithmetic.eml --run
```
