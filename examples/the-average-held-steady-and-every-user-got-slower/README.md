# The average held steady and every user got slower

`the_average_held_steady_and_every_user_got_slower.eml` - Mean response time this quarter is within a hundredth of a millisecond of last quarter. Two groups of users make up that mean. What happened to each of them is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Tracking the mean is correct and it was chosen over the alternatives for reasons that hold. It is the one latency statistic that composes: total time divided by total requests, comparable across any two periods, with no assumption about the shape. It cannot be gamed by moving a threshold and it does not need a histogram to compute. The number is exact.

A mean over two groups is a weighted average, and it has two inputs: what each group experiences, and how many are in each group. Only one of those is about performance.

So the mean is stable, correctly, while both of its inputs move.

```
last quarter
  cached   : 8000 requests at 20 ms
  uncached : 2000 requests at 200 ms
  total    : 10000 requests, 560000 ms
  mean     : 56 point 0 ms
```

```
this quarter
  cached   : 8518 requests at 24 ms
  uncached : 1482 requests at 240 ms
  total    : 10000 requests, 560112 ms
  mean     : 56 point 1 ms
```

```
  change in the mean, in hundredths of a millisecond : 1
```

```
group      before   after   change
  cached     20 ms   24 ms   20 percent slower
  uncached   200 ms  240 ms  20 percent slower
  overall    56 ms   56 ms   slower by 1 in hundredths
```

```
  there is no group in that table whose experience improved
  and no group whose experience is described by the third row
```

```
share of requests served from cache
  last quarter : 800 per mille
  this quarter : 851 per mille
  shift        : 51 per mille toward the fast group
```

```
  the cache hit rate went up, which is a real improvement
  and it is the entire reason the third row holds still
```

```
this quarter's latencies, last quarter's mix
  mean : 67 point 20 ms
  against the reported mean of 56 point 1
  the mix is worth 11 ms of apparent improvement
```

```
  which is very close to the 11 ms the slowdown cost
```

```
control - is the mean correct
  last quarter, recomputed : 560000 over 10000
  this quarter, recomputed : 560112 over 10000
  rounding applied         : none, these are exact totals
  defects in the statistic : 0
```

```
  every user's time is in those totals exactly once
```

```
null control - the same mean when the mix does not move
  cached share, both quarters : 800 per mille
  mean, last quarter : 56 point 0 ms
  mean, this quarter : 67 point 20 ms
  change, in hundredths : 1120, and every group is slower
  the statistic did not change; one of its two inputs stopped moving
```

```
what a stable aggregate is evidence of
  the aggregate did not move       : yes, exactly
  the parts did not move           : not implied
  the parts moved in opposite ways : not implied either
  a weighted mean has two inputs and reports their product
```

```
the fix is not a different statistic; the mean is the right one
it is to publish the weights beside it, so a flat line has to
say whether the experience or the population held still
```

The mean is exact in both quarters - 560000 ms over 10000 requests and 560112 over 10000 - and the change between them, in hundredths of a millisecond, is 1. Cached requests got 20 percent slower, uncached 20 percent slower, and the cache share rose 51 per mille, which is worth 11 ms of apparent improvement against a slowdown that cost 11 ms.

Verify it yourself:

```bash
pnpm eml run examples/the-average-held-steady-and-every-user-got-slower/the_average_held_steady_and_every_user_got_slower.eml
```
