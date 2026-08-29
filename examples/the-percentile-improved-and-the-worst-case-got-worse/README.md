# The percentile improved and the worst case got worse

`the_percentile_improved_and_the_worst_case_got_worse.eml` - A hedged request was added: if the first attempt has not answered in a hundred milliseconds, send a second one and take whichever returns first. The p99 improved. What happened above the p99 is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Hedging is correct and it is the right tool for this shape of tail. Most slow responses here are slow for a reason that does not recur - a cold connection, an unlucky scheduling slot, a node mid-compaction - so a second attempt usually lands on a healthy path and returns while the first is still waiting. The hedge threshold was set from the measured distribution, not guessed, and it costs one extra request only on the slice that was already slow.

A percentile is a position in a sorted list. It is defined by what sits at that position and is unaffected by everything above it. The slowest requests are above every percentile that is published.

The hedge is a second request. On the requests that are slow because the backend is saturated, that is one more request into a saturated backend.

```
sample                  : 1000 requests
  900 at 40 ms
  95 at 120 ms
  4 at 800 ms
  1 at 1500 ms
```

```
the p99 sits at position 990 of 1000
  requests at or below 120 ms : 995
  so position 990 holds a 120 ms request
  requests above it : 10
```

```
metric        before      after     change
  p50         40 ms       40 ms      none
  p99         120 ms      105 ms     15 ms better
  max         1500 ms     2300 ms    800 ms worse
```

```
  p99 improved by : 12 percent
  max degraded by : 53 percent
```

```
group           count   before   after   direction
  fast            900     40 ms    40 ms   unchanged, below the hedge
  middle          95     120 ms   105 ms   better
  slow            4      800 ms   860 ms   worse
  worst           1      1500 ms  2300 ms  worse
```

```
  requests better or unchanged : 995
  requests worse               : 5
  requests worse, as a share   : 50 per ten thousand
```

```
  every request that got worse is above the p99, by construction:
  the hedge only fires on requests slower than 100 ms
```

```
hedges fired       : 100 of 1000
  on the middle group : 95, second attempt wins, this is the win
  on the slow group   : 5, second attempt queues behind the first
```

```
  extra backend requests : 10 percent
  the group that is slow because the backend is busy receives
  the extra request the hedge sends
```

```
milliseconds saved on the middle group : 1425
milliseconds added to the slow groups  : 1040
net across the sample                  : 385 ms saved
```

```
  the net is favourable and the percentile is favourable
  and 5 users wait longer than anyone waited before
```

```
control - is the hedge working
  p99 before : 120 ms
  p99 after  : 105 ms
  extra load : 10 percent, not 100
  requests helped : 95
  defects in the hedge : 0
```

```
  removing it returns 95 requests to 120 ms to spare 5
```

```
null control - the same hedge with capacity to absorb it
  p99 : 120 to 105 ms
  max : 1500 to 1500 ms
  requests worse : 0
  same hedge, same threshold, same percentile improvement
  what changed is whether the extra request had somewhere to go
```

```
what a percentile can and cannot report
  the value at its position   : exactly
  the values above it         : nothing, that is its definition
  whether a change moved them : nothing
  and a tail fix acts precisely on the region it cannot see
```

```
publish the maximum next to the percentile, not because the
maximum is a good statistic, but because it is the only one
positioned where a tail intervention does its work
```

The hedge cut the p99 from 120 to 105 ms, 12 percent, for 10 percent extra load rather than double, helping 95 requests and saving 385 ms net across the sample. The 5 requests that were slow because the backend was busy each received an extra request into that backend, taking the maximum from 1500 to 2300 ms - 53 percent worse, entirely above the p99.

Verify it yourself:

```bash
pnpm eml run examples/the-percentile-improved-and-the-worst-case-got-worse/the_percentile_improved_and_the_worst_case_got_worse.eml
```
