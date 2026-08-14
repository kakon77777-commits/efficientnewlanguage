# Bucketed by when it arrived — the totals reconcile and the shape does not

`bucketed_by_when_it_arrived.eml` builds a daily series two ways from the same
18 events.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: bucketing by arrival is the choice that always works.
Arrival time is stamped by the system doing the bucketing — never missing, never
in the future, never revised. Event time comes from the source and has all three
problems. So the reliable field is the one that answers a question about the
pipeline rather than about the world.

```
events : 18, of which delayed : 7

day   by event   by arrival
  1        3          3
  2        2          2
  3        4          4
  4        4          0
  5        3          0
  6        2          9
```

```
busiest day
  by event   : day 3 with 4
  by arrival : day 6 with 9
  the two series name different days

  day 4 : arrival says 0, 4 things happened
  day 5 : arrival says 0, 3 things happened
  days reported empty that were not : 2
```

**Why the discrepancy survives a reconciliation check** — nothing is lost and
nothing is duplicated, only the assignment to days differs:

```
totals
  by event   : 18
  by arrival : 18
  the totals reconcile, and the daily shape does not
```

**The control** runs the same code over a stretch with no delay, so
arrival-bucketing is not condemned in general:

```
control - days 1 to 3, nothing delayed
  days where the two series agree : 3 of 3
```

Arrival time is the field that is always there. It answers a question about the
pipeline, and the chart is captioned with a question about the world.

Verify it yourself:

```bash
pnpm eml run examples/bucketed-by-when-it-arrived/bucketed_by_when_it_arrived.eml
```
