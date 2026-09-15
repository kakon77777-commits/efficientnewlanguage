# The long runs were oversampled by the sampler

`the_long_runs_were_oversampled_by_the_sampler.eml` - A profiler estimates the average request latency by sampling the currently-running request at random instants, and it averages the samples correctly. How a request comes to be sampled is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real latency of each sampled request, not an estimate; it counts every sample; the mean is the honest average of the samples; and the intent is exactly 'the average request latency'.

A request is sampled when the clock ticks while it is running, so a request is selected with probability proportional to its duration - the long ones span more ticks and are over-represented.

```
requests                        : 100000
true mean latency per request   : 20 ms
sampled mean latency            : 50 ms
long requests, share of traffic : 200 per myriad
long requests, share of samples : 2000 per myriad
ms the length-bias added        : 30
overstated share of the mean    : 6000 per ten thousand
```

```
the latency estimate
  reads : the real latency of each sampled request
  counts : every sample taken
  mean : the honest average of the samples
  intent : the average request latency
  samples omitted : 0
  verdict : SAMPLED MEAN IS 50 MS, COMPUTED CORRECTLY
```

```
  averaging the real latency over every sample is the part
  done right here, and it is why 50 ms is the correct mean
  of the samples that were taken
```

```
the sampling rule
  when a request is sampled : a clock tick lands while it
    is running
  so its chance of being sampled : is proportional to its
    duration
  a request twice as long : is twice as likely to be caught
  long requests, 2 percent of traffic : are 20 percent of
    the samples
  so the sample : is weighted by length, not one-per-request
```

```
the result of the profiler
  reported average latency : 50 ms
  true per-request average : 20 ms
  milliseconds added by the length-bias : 30
  is the sample mean miscomputed : no; 50 is exact for the
    samples
  is 50 the per-request average : no; sampling by time
    over-weights the long requests
```

```
null control - sample once per request, not per clock tick
  mean sampled by time : 50 ms
  mean sampled by request : 20 ms
  long-request over-weight removed : 2000 per myriad
  no request and no latency changed; each request stopped
  being weighted by how long it ran and started counting
  once
```

```
what a mean of time-sampled latencies guarantees
  it is the correct mean of the samples : exactly, real
    latencies, every sample, honest average
  it is the average request latency : not addressed;
    sampling on a clock tick selects a request in proportion
    to its duration, so the long ones are over-represented
    and the mean rises from 20 to 50
```

```
sampling by the moment favors whatever lasts longer, because a longer thing is in
more moments; the average that results is weighted by duration, and a per-item
question answered by a per-instant sample counts the big items more than once
```

It averages the real latency over every sample - 50 ms is the exact sample mean. But a request is sampled in proportion to how long it runs, so the long ones are over-represented; sampling once per request gives 20 ms, the length-bias adding 6000 per ten thousand, until the sample is taken per request.

Verify it yourself:

```bash
pnpm eml run examples/the-long-runs-were-oversampled-by-the-sampler/the_long_runs_were_oversampled_by_the_sampler.eml
```
