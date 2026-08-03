# The percentile you threw away at write time

`counter_vs_histogram.eml` summarises two workloads with the same mean and very different tails, then tries to recover the percentiles from each summary.

**What it exercises**: the mean is a projection. The information a
percentile needs is discarded when the metric is defined, so this is not
a query you can add later. Measured: both workloads report a mean of
99–102; the p99s are **105 and 2000**.

The histogram's cost is reported alongside its benefit, because "correct"
without it is half an answer. It is never exact — 0 of 6 queries — and
it is always an upper bound, 6 of 6. A bound is what it sells; a summary
that sometimes under-reports the tail would be worse than one that is
merely imprecise.

The first version re-sorted inside `percentile()`, which with an
insertion sort is O(n²) per call and produced a 212 MB execution trace
for thirty lines of output.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  histogram exactly right:       0/6
...a bound is what it sells; exactness is not on offer.

integers stored per workload:
  raw:       120
  counter:   2
  histogram: 8

checks passed: 5/5
Same mean, tails an order of magnitude apart. The counter cannot tell.

The information a percentile needs is discarded at WRITE time, so this is
not a query you can add later - it is a decision made when the metric was
defined, usually by someone who was asked for 'average latency'. The
histogram costs six more integers and buys every percentile at once, with
a precision fixed by the buckets rather than by the reader.
```
