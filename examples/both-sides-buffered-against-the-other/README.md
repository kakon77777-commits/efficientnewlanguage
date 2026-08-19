# Both sides buffered against the other

`both_sides_buffered_against_the_other.eml` - Each side added a queue against the other's variability. What the pair does to the time a unit of work spends in the system is simulated rather than assumed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both queues are right and both have a before-and-after to prove it. Without the upstream queue a burst is refused; without the downstream one an uneven answer stalls the sender. Each side measured its own drops, added a queue, and watched the drops go to zero. Nobody was careless.

A queue converts a drop into a wait. Each side then measures the wait in its own queue, correctly, and reports it. The unit of work waits in both, and the sum is not on either dashboard because neither system can see the other's depth.

Both queues are run over the same arrivals.

```
periods : 12, work arriving : 90
handoff rate : 9 per period
service  : 9 5 9 6 9 5 9 6 9 5 9 9  (total 90)
arrivals : 10 2 14 3 12 1 15 4 11 2 13 3 
```

```
queues held        completed   dropped   waited upstream   waited downstream
  neither          69          21        0                0
  upstream only    85          5        23               0
  downstream only  69          21        0                0
  both             88          0        23               24
```

```
the two queues turned 21 dropped units into delivered ones
  which is the whole case for having them, and it is a real gain
```

```
queue-time carried, with both queues in place
  the upstream team reports   : 23
  the downstream team reports : 24
  a unit of work waits in     : 47
  larger than either report, because the two are added and neither
  system can read the other's depth
  the larger of the two reports is 24, which is 51% of the truth
```

```
adding the second queue changed deliveries by 3
  and added 24 to the queue-time carried
  the second queue is the one whose gain is small and whose delay is not
```

```
if the upstream removes its queue while the downstream keeps one
  dropped : 21 against 0 with both
if the downstream removes its queue while the upstream keeps one
  dropped : 5 against 0 with both
  each unilateral removal costs deliveries, so each side's own experiment
  tells it to keep its queue, and both experiments are correct
```

```
control - arrivals that never exceed the handoff rate
  arriving : 60 over 12 periods, handoff 9
  every period is inside the handoff rate and inside the service dips,
  so nothing queues and the four configurations cannot be told apart
```

Each queue removed the drops its owner could see, and each side's before-and-after is sound. The wait a unit of work experiences is the sum of two depths, and it is reported by neither.

Verify it yourself:

```bash
pnpm eml run examples/both-sides-buffered-against-the-other/both_sides_buffered_against_the_other.eml
```
