# The expert keeps the recovery time below the threshold

`the_expert_keeps_the_recovery_time_below_the_threshold.eml` - A module is hard to debug and one engineer is very good at debugging it. What that does to the case for simplifying it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: She is not hoarding anything. She has written notes, she pairs willingly, she has asked twice for time to refactor it, and she answers at 02:00 without complaint. Nothing here is about a person behaving badly.

The case for simplification is built from recovery time. Recovery time is measured with her in it, because she is always in it. So the module's cost is recorded at the level one expert can hold it down to, and the number that would justify the work is suppressed by the same thing that makes the work feel unnecessary.

Incidents are timed with and without her.

```
incident class          per year   with her   without her   threshold
  parser state desync   9         22 min     260 min      120 min
  cache key collision   4         15 min     190 min      120 min
  retry storm in adapter   6         30 min     340 min      120 min
  schema version skew   3         40 min     400 min      120 min
  clock drift handling   2         25 min     300 min      120 min
```

```
incidents a year : 24
recovery minutes with her    : 608, mean 25
recovery minutes without her : 6940, mean 289
ratio : 11 to 1
```

```
the refactor is funded when mean recovery exceeds 120 minutes
  classes over the threshold, as measured : 0 of 5
  classes over the threshold, without her : 5 of 5
  so the rule never fires, and it is reading a real measurement
```

```
what the recorded number is made of
  the module's difficulty : unchanged across the whole period
  the recorded recovery time : 25 minutes
  the same difficulty measured through anyone else : 289 minutes
  the metric is a property of the pair, and only one half of the pair is
  a property of the system
```

```
the refactor requests
  Q1 : 12 days requested, granted: no, recovery time cited: 26 min
  Q3 : 8 days requested, granted: no, recovery time cited: 26 min
  both decisions used the measured number and both were consistent with it
  neither decision was careless and neither reviewer saw anything wrong
```

```
the year she is not available
  recovery hours as recorded : 10
  recovery hours without her : 115
  difference : 105 hours
  probability she is unavailable in a given year : not estimated anywhere
  the exposure is a product of a number nobody computes and a number
  nobody has
```

```
measurements that do not include her
  time for a second engineer to resolve, measured : never
  incidents she was deliberately not paged for   : 0
  runbook coverage of the five classes           : notes exist, untested
  the experiment that would produce the other column is one incident
  handled without her on purpose, and it has not been run
```

```
control - ledger reconciler, also difficult, two people know it
  with the first  : 95 min
  with the second : 110 min
  spread : 15 min, against 238 for the first class above
  the recorded number is close to the number anybody would get, so
  when it crosses the threshold it crosses for a reason about the code
```

She has asked twice, pairs willingly and answers at 02:00. The refactor is funded on recovery time, recovery time is measured with her in it, and she holds it at 25 minutes against a 120-minute bar.

Verify it yourself:

```bash
pnpm eml run examples/the-expert-keeps-the-recovery-time-below-the-threshold/the_expert_keeps_the_recovery_time_below_the_threshold.eml
```
