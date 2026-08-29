# The cache was warm and one request paid for all of them

`the_cache_was_warm_and_one_request_paid_for_all_of_them.eml` - A computed page is cached with a sixty second expiry. The hit rate is above ninety-nine percent and mean latency is a few milliseconds. Who pays the recompute is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The cache is correct and the design is the standard one. A sixty second entry keeps the page fresh enough for what it shows, single-flight means one recompute rather than a stampede, and the backend sees a tiny fraction of the load it would otherwise. Every number the cache reports about itself is true and every one of them is good.

A hit rate is a statement about requests. Latency spent is a statement about whoever was holding the request. The cache averages the first and assigns the second, and averaging and assigning are not the same operation.

The recompute does not get cheaper because it is rare. It gets rarer.

```
requests per minute   : 5000
entry lifetime        : 60 seconds
recomputes per minute : 1, single-flight
a hit costs           : 4 ms
a miss costs          : 3200 ms
```

```
the cache's own numbers
  hits per minute  : 4999
  misses           : 1
  hit rate         : 9998 per ten thousand
  mean latency     : 4 point 63 ms
  backend load     : 1 of 5000
```

```
  every one of those is true and every one is good
```

```
the one request that missed
  its latency          : 3200 ms
  a hit's latency      : 4 ms
  ratio                : 800 times
  ratio to the mean    : 691 times
```

```
  victims per hour : 60
  victims per day  : 1440
  each of them a real person waiting 3200 ms
```

```
minute   requests   hits   misses   ms spent on hits   ms spent on the miss
  1        5000      4999      1         19996              3200
  2        5000      4999      1         19996              3200
  3        5000      4999      1         19996              3200
  4        5000      4999      1         19996              3200
```

```
  share of all latency spent by 1 request of 5000 : 137 per mille
```

```
where the victim lands in the distribution
  p50 : 4 ms
  p95 : 4 ms
  p99 : 4 ms
  max : 3200 ms
  the miss is 2 per ten thousand of requests, so no percentile
  below the very top can contain it
```

```
control - is the cache doing its job
  backend computations without it : 5000 per minute
  backend computations with it    : 1 per minute
  reduction                       : 5000 times
  stampedes                       : 0, single-flight holds
  defects in the cache            : 0
```

```
  removing the cache makes every request a 3200 ms request
```

```
null control - the same cache refreshed ahead of expiry
  recomputes per minute : 1
  hit rate              : 9998 per ten thousand, unchanged
  backend load          : unchanged
  requests waiting 3200 ms : 0 per day
  the work did not move or shrink; it left the request path
```

```
what a hit rate averages and what it does not
  cost across requests : averaged, and the average is honest
  cost to a request    : assigned, in full, to one of them
  and the assignment has no term in the hit rate
```

```
a rare expensive path is not a small cost spread thin
it is a full cost handed to somebody, on a schedule
```

The cache turns 5000 backend computations a minute into 1, a factor of 5000, with 0 stampedes and a hit rate of 9998 per ten thousand. Mean latency reads 4 point 63 ms because 137 per mille of all latency is spent by 1 request in 5000, and that request waits 3200 ms - 800 times a hit - 1440 times a day.

Verify it yourself:

```bash
pnpm eml run examples/the-cache-was-warm-and-one-request-paid-for-all-of-them/the_cache_was_warm_and_one_request_paid_for_all_of_them.eml
```
