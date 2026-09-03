# The benchmark was isolated and the machine was shared

`the_benchmark_was_isolated_and_the_machine_was_shared.eml` - The benchmark pins a core, disables frequency scaling, warms the caches and reports a confidence interval of four parts in a thousand. What it measures is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The methodology is careful. The process is pinned to one core, the governor is set to performance so no clock changes under it, a thousand iterations run after a warm-up that is discarded, outliers are reported rather than dropped, and the interval is computed properly rather than as a range. This is better than most benchmarks in most repositories.

All of that isolates the measurement WITHIN the process. It runs on a shared runner, so the other tenants of that machine are outside every one of those controls — the pinned core shares a memory controller and a last-level cache with cores this benchmark does not own.

The interval is tight and the same commit measures differently on Tuesday.

```
iterations                   : 1000
reported interval            : 40 per ten thousand
```

```
same commit, quiet runner, ns: 12400
same commit, busy runner, ns : 19800
between-run spread           : 5967 per ten thousand
the spread is the interval times : 149
```

```
the benchmark's controls
  core pinned          : yes
  frequency scaling    : disabled
  warm-up              : run and discarded
  iterations           : 1000
  outliers             : reported, not dropped
  interval computed properly : yes
  faults found in review : 0
  verdict              : ISOLATED
```

```
  every one of those is a real control and each removes a
  real source of variance
```

```
the reported 40 per ten thousand
  computed over        : 1000 iterations in one process
  what it bounds       : how much this run's own samples
    disagree with each other
  what it does not bound : how much this run disagrees
    with the next one
```

```
  a tight interval over one population is not a claim
  about a second population it never sampled
```

```
the shared runner
  cores this process owns : 1
  cores the machine has   : shared with other jobs
  last-level cache        : shared
  memory bandwidth        : shared
  a control for any of those : none, and pinning is what
    makes it look as though there is
```

```
the regression gate
  fails a change moving more than : 40 per ten thousand
  machine noise, either direction : up to 2983
  so the gate decides on           : which runner it got
  a real regression it would catch : one larger than the
    noise, which is a regression nobody needs a benchmark
    to notice
```

```
null control - the interval computed across runners
  methodology faults  : 0, unchanged
  runs across runners : 5
  reported interval   : 5967 per ten thousand
  the benchmark did not get noisier; the interval started
  covering the variance that decides the gate
```

```
what a careful benchmark guarantees
  this measurement is repeatable within itself : exactly
  this measurement is comparable to the last one : not
    addressed; every control it applies is inside the
    process, and the variance that matters is outside
```

```
an interval describes the population it was computed over;
comparing two runs is a question about a population of runs,
and one run cannot sample it
```

The methodology is careful and review found 0 faults: pinned core, no frequency scaling, discarded warm-up, 1000 iterations, outliers reported. Its interval of 40 per ten thousand covers disagreement among its own samples, while the same commit measures 12400 ns and 19800 ns on two runners - a spread of 5967 per ten thousand, 149 times the interval the gate compares against.

Verify it yourself:

```bash
pnpm eml run examples/the-benchmark-was-isolated-and-the-machine-was-shared/the_benchmark_was_isolated_and_the_machine_was_shared.eml
```
