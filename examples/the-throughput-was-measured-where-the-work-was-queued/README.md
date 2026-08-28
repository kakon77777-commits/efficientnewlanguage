# The throughput was measured where the work was queued

`the_throughput_was_measured_where_the_work_was_queued.eml` - The throughput graph has read a steady 1200 per second all shift. What the system finished in that shift is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Instrumenting at the ingress is the right place to start and the reasons are good. It is one point in the code rather than one per worker, it cannot be skipped by a worker that crashes before reporting, it needs no coordination between processes, and it is the only place where a request is guaranteed to exist exactly once. Everything about the counter's placement is defensible.

What it counts is arrivals. A request that is accepted has not been done; it has been promised. When the consumer keeps up, the two rates are equal and the distinction has no consequence, which is why it survived design review.

The distinction becomes the entire story exactly when the consumer stops keeping up, which is the situation the graph exists to reveal.

```
accepted per second  : 1200   <- this is the throughput graph
completed per second : 900
backlog per second   : 300
```

```
over one 8-hour shift
  accepted  : 34560000
  completed : 25920000
  waiting   : 8640000
```

```
  the graph is flat at 1200 for the whole shift
  it is flat because arrivals are steady, which they are
```

```
hour   accepted   completed   backlog after
  2      4320000    3240000     2160000
  4      4320000    3240000     4320000
  6      4320000    3240000     6480000
  8      4320000    3240000     8640000
```

```
  the accepted column is constant and the backlog column is not
  only one of them is on a dashboard
```

```
clearing the backlog after the shift
  overnight arrival rate : 500 per second
  drain rate             : 400 per second
  backlog to clear       : 8640000
  seconds to clear       : 21600
  hours to clear         : 6
  the next shift starts before it finishes
```

```
counter placement   what it measures   what it misses
  at ingress          arrivals           whether the work was done
  at egress           completions        requests that never reach a worker
  both                everything         nothing, and the difference IS the
                                         quantity that matters
```

```
  the difference needs two counters and one subtraction
  neither counter alone can produce it, which is why one counter was enough
  for as long as the two were equal
```

```
control - is the ingress counter accurate
  requests that arrived : 34560000
  requests it counted   : 34560000
  missed                : 0
  double-counted        : 0
  errors in the counter : 0
  it measures arrivals exactly, and its label says throughput
```

```
null control - the same counter when the consumer keeps up
  accepted per second  : 1200
  completed per second : 1200
  backlog per second   : 0
  graph reads          : 1200, and it is true
  same counter, same placement, same label
  the label becomes false exactly when the two rates separate, which is
  the only time anyone reads the graph carefully
```

```
a rate measured at the front of a pipeline
  equals the completion rate      while nothing accumulates
  exceeds it                      while something does
  never falls below it            over any interval
  so it is an upper bound reported as a measurement
  and it is highest exactly when the system is worst
```

```
a queue depth graph beside it would have told the whole story,
and a queue depth is not a rate, so it did not belong to the same panel
```

Counting at the ingress needs one instrumentation point instead of one per worker, cannot be skipped by a worker that dies, and sees every request exactly once - all true. It counts arrivals. Over one shift 34560000 arrived and 25920000 finished, leaving 8640000 waiting and 6 hours of drain that the next shift starts on top of, while the graph held flat at 1200 throughout.

Verify it yourself:

```bash
pnpm eml run examples/the-throughput-was-measured-where-the-work-was-queued/the_throughput_was_measured_where_the_work_was_queued.eml
```
