# The queue drained and the oldest item was never served

`the_queue_drained_and_the_oldest_item_was_never_served.eml` - A work queue is drained continuously, its depth is stable, and throughput matches arrivals. What happens to the item at the bottom is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Serving the newest item first is correct here and it was chosen with a reason. These are interactive requests: a caller that has been waiting eight seconds has usually gone, and the response to it is thrown away, so spending a worker on the freshest item converts the same throughput into more answered callers. Under a burst it is measurably better than the alternative.

A queue's depth is a level. It says how many are waiting, not which ones, and a level can hold perfectly still while its contents never turn over.

The oldest item is the one every policy here agrees to postpone.

```
arrivals per second : 400
served per second   : 400
queue depth         : 1200, stable
abandon after       : 8 seconds
```

```
the queue's own numbers
  arrivals and departures balanced : yes, 400 each
  depth trend                      : flat
  overflow events                  : 0
  items dropped by the queue       : 0
  workers idle                     : 0
```

```
  a queue that is not growing and not dropping
```

```
if the queue were served oldest first
  wait for any item : 3 seconds
  items abandoned   : 0, since 3 is under 8
```

```
under newest-first, at the same depth and the same rates
  wait for a newly arrived item : near zero
  wait for the item at the bottom : it is passed over by every
    arrival, and 400 arrive each second
```

```
second   arrivals since   served   position from the bottom
  1        400             400      1200
  2        800             800      1200
  3        1200             1200      1200
  4        1600             1600      1200
  5        2000             2000      1200
```

```
  the bottom item's position does not improve, because
  arrivals and service are equal and service starts at the top
```

```
items that will never be served while the rate holds : 1200
  that is 3 point 0 seconds of arrivals
  each of them a caller waiting past 8 seconds
```

```
  callers abandoned                : 1200
  arrivals per minute              : 24000
  abandonment rate                 : 500 per ten thousand
```

```
metric              value        reads as
  queue depth         1200         stable, healthy
  throughput          400/s        matching demand
  worker utilisation  100 percent  fully used
  mean wait           near zero    excellent
  oldest item age     not measured  -
```

```
  the mean wait is near zero and it is the true mean:
  almost every served item was served immediately
```

```
control - is newest-first the better policy here
  callers answered under newest-first, per second : 400
  callers answered under oldest-first during a burst : fewer,
    because some completions land after the caller left
  wasted completions under newest-first : 0
  defects in the policy : 0
```

```
  the policy is right about the thing it optimises
```

```
null control - the same policy with spare service capacity
  served per second : 520
  net drain         : 120 per second
  seconds to empty  : 10
  items never served : 0
  same policy, same queue, same threshold
  the ordering only matters while the queue does not empty
```

```
what a stable queue depth is evidence of
  arrivals equal departures : yes, exactly
  no item is stuck          : not implied, and here it is false
  the level is a count, and a count has no identity in it
```

```
the number that is missing is the age of the oldest item,
which under this policy is the only one a depth cannot bound
```

The queue is balanced at 400 arrivals and 400 completions a second, with 0 overflows, 0 drops, 0 idle workers and a mean wait near zero, and newest-first is the policy that answers the most callers under a burst. At a steady depth of 1200, the items below the arrival point are passed over by all 400 arrivals each second, so 1200 callers - 500 per ten thousand a minute - wait past 8 seconds and leave, while every dashboard above reads healthy.

Verify it yourself:

```bash
pnpm eml run examples/the-queue-drained-and-the-oldest-item-was-never-served/the_queue_drained_and_the_oldest_item_was_never_served.eml
```
