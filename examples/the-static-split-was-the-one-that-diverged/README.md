# The static split was the one that diverged

`the_static_split_was_the_one_that_diverged.eml` - The scaler moves workers towards whichever queue is deeper, and it acts on numbers that are already stale. Whether that makes it unstable is simulated rather than argued.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The worry is a real one and it has a name. A controller that reacts to a measurement taken before its last action landed can chase its own tail, and the usual advice is to damp it, to widen the interval, or to pin the allocation and stop reacting at all.

Pinning it is also a policy, and it is the one with no feedback. What each policy does is a property of the arrival rates and the delay, so both are run over the same arrivals here and the backlog is integrated over time.

```
workers : 20, intervals : 30
arrivals per interval : 12 and 8, total 20
spare capacity : 0
the scaler acts on depths measured 3 intervals earlier
```

```
policy                 backlog over time   worst interval   queue A at the end
  chases the deeper    1134                38              22
  pinned at half each  1890                92             84
```

```
the pinned split carries 756 more backlog-intervals, which is 66% more
and it ends with queue A 62 deeper, still climbing
  the policy with no feedback is the one that runs away, because half the
  workers is less than queue A's arrival rate and nothing corrects it
```

```
lag cost, at three levels of spare capacity
spare   lag 1     lag 3     penalty
  4      512      554      8%
  1      675      857      26%
  0      1020      1134      11%
```

```
  worst penalty : 26%, at spare capacity 1
  it is not the tightest setting that suffers most. At spare 0 both
  policies are already saturated, so a misallocation costs less as a
  share of a backlog that was going to be large anyway. The delay hurts
  most where the capacity was nearly enough
```

```
allocation swing over the last 10 intervals
spare   lag 1   lag 3
  4      0       0
  1      0       4
  0      0       2
```

```
  the largest swing here is 4 workers, at spare capacity 1 and lag 3
  and the same rates with lag 1 hold a steady allocation
  so the instability is a property of the pair, not of reacting at all
```

```
control - arrivals 8 and 4 against 20 workers
  chasing : backlog 398, queue A at the end 8
  pinned  : backlog 416, queue A at the end 8
  both end at the same depth, so this workload cannot separate them
```

Reacting to a stale measurement is a real hazard and the delay has a price that grows as the slack runs out. The policy that diverged here is the one that stopped reacting.

Verify it yourself:

```bash
pnpm eml run examples/the-static-split-was-the-one-that-diverged/the_static_split_was_the_one_that_diverged.eml
```
