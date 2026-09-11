# The percentile was averaged across the shards

`the_percentile_was_averaged_across_the_shards.eml` - The dashboard p99 latency has been under the 300 ms SLO all quarter, and each per-shard number it combines is true. How the one figure is combined is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful per shard. Each shard computes its p99 from its own real request latencies, over the full window, not a sample; the histogram buckets are fine near the tail; and the SLO is checked every minute.

The one number on the dashboard is the mean of the shards' p99s.

```
shards                          : 20
  typical shard p99             : 180 ms
  hot shard p99                 : 950 ms
sum of the shard p99s           : 4370 ms
reported p99 (mean of them)     : 218 ms
SLO                             : 300 ms
  headroom the dashboard shows  : 82 ms
```

```
pooled p99 (over all requests)  : 940 ms
  over the SLO by               : 640 ms
hot shard share of traffic      : 500 per ten thousand
```

```
the per-shard p99
  computed from : each shard's real latencies
  over : the full window, not a sample
  tail buckets : fine-grained
  checked : every minute against the SLO
  shards inside their own p99 budget : all 20
  verdict : WITHIN SLO
```

```
  fine tail buckets are the part almost nobody funds, and
  they are why each shard's p99 is itself trustworthy
```

```
the mean of the p99s
  what was averaged : twenty per-shard 99th percentiles
  what a mean of quantiles is : not a quantile of the
    pool; the 99th percentile is not additive
  the hot shard in the mean : one term of twenty, so its
    950 is diluted to 218 ms
  the hot shard in the pool : 
    500 per ten thousand of requests, all slow
  so the slowest one percent of the pool : lands inside
    that shard, at 940 ms
```

```
the callers of the hot shard
  their p99 : 950 ms
  what the dashboard shows : 218 ms, within SLO
  their share of all requests : 
    500 per ten thousand
  is any single number wrong : no; each shard p99 is
    correct, and the mean of them is correctly computed
  the pooled p99 they are inside : 940 ms
```

```
null control - one p99 over the merged requests
  mean of the shard p99s : 218 ms, unchanged
  pooled p99 : 940 ms
  shards holding the pooled tail : 
    1
  no latency changed; the combining step stopped averaging
  summaries and started ranking the requests
```

```
what a p99 under the SLO guarantees
  each shard's own p99 is under budget : exactly, all 
    20 of them, from real latencies over the full window
  the 99th percentile request is under budget : not
    addressed; the figure is the mean of twenty per-shard
    p99s, and a quantile of a pool is not the mean of the
    quantiles - pooled, it is 940 ms
```

```
a percentile is a rank over a set, and the mean of the ranks
of subsets is a different number; when one subset holds the
whole tail, averaging its rank away is what hides it
```

Each shard's p99 is real, over the full window, with fine tail buckets - 218 ms against a 300 ms SLO. The dashboard averages the twenty p99s, and a quantile is not additive, so the hot shard's 950 ms - 500 per ten thousand of traffic - puts the pooled p99 at 940 ms, 640 ms over.

Verify it yourself:

```bash
pnpm eml run examples/the-percentile-was-averaged-across-the-shards/the_percentile_was_averaged_across_the_shards.eml
```
