# The work moved to where nobody measures - chart says 66% better, system is 9 worse

`the_work_moved_to_where_nobody_measures.eml` runs the same job list under both routings, so the comparison is between two policies rather than two measurements.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: instrumenting stage A first was the right order - it is the stage users wait on, and one good chart beats six mediocre ones. The repair that follows is also reasonable: work that need not block the reply is deferred to B. That really does help when B has slack, and whether B has slack is a fact about B, which is the stage with no chart.

```
before - everything runs in A
  stage A : 54
  stage B : 0
  total   : 54
```

```
after - deferrable work moved to B
  stage A : 18
  stage B : 45
  total   : 63
```

```
what the dashboard shows, which is stage A
  before : 54
  after  : 18
  improvement : 66%
```

```
what the system does
  before : 54
  after  : 63
  worse by : 9
  the work costs more where it landed, and B has no chart
```

```
deferred jobs, and what the move cost each
  j1 : 6 in A -> 7 in B  (+1)
  j3 : 9 in A -> 11 in B  (+2)
  j5 : 8 in A -> 10 in B  (+2)
  j7 : 7 in A -> 9 in B  (+2)
  j9 : 6 in A -> 8 in B  (+2)
  total added : 9
  and that is exactly the whole regression
```

```
  improvement the chart reports : 36
  improvement the system got    : -9
  difference                    : 45
```

```
control - the same move, where B is genuinely cheaper
  before total : 26
  after total  : 18
  here the chart and the system agree, and both improved
```

The chart measures a stage. The improvement was measured on the stage and paid for somewhere the measurement does not reach.

The **control** is the same move where B is genuinely cheaper - there the chart and the system agree. Moving work is not the defect; moving it somewhere it costs more is, and the chart cannot tell those apart because it only sees the origin.

Verify it yourself:

```bash
pnpm eml run examples/the-work-moved-to-where-nobody-measures/the_work_moved_to_where_nobody_measures.eml
```
