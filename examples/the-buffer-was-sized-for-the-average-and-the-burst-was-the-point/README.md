# The buffer was sized for the average and the burst was the point

`the_buffer_was_sized_for_the_average_and_the_burst_was_the_point.eml` - Events arrive at 100 a second on average. The buffer holds 200, which is twice the average, and the consumer drains 120 a second. What happens during the burst is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Sizing at twice the average is a real rule, applied deliberately, and it was defended in review with two correct arguments. Memory is not free and a buffer is memory held permanently against an event that may not come. And an oversized buffer is worse than a small one under sustained overload: it absorbs the backlog silently, so the producer never sees backpressure and the consumer serves data that is minutes stale. Both of these are true.

Both arguments are about SUSTAINED load, where the buffer's job is to be small. A buffer's other job is to absorb a burst, where its job is to be large enough for the burst. The two jobs are sized by different numbers, and the average is not one of them.

What a burst costs is the burst size minus what drains during it. Neither term is the average arrival rate. The average appears nowhere in the calculation that decides whether events are lost.

```
average arrival : 100 per second
buffer          : 200, which is 2 times the average
consumer drains : 120 per second
```

```
steady state at 100 per second
  arrivals per second : 100
  drained per second  : 120
  buffer depth        : 0, the consumer is 20 per second faster
  headroom used       : 0 of 200
```

```
a burst of 800 per second for 3 seconds
  events arriving      : 2400
  drained during it    : 360
  held by the buffer   : 200
  absorbed in total    : 560
  dropped              : 1840, which is 76 percent of the burst
```

```
second   arriving   drained   in buffer   dropped this second
  1        800        120       200         480
  2        800        120       200         680
  3        800        120       200         680
  4        100        120       180         0
  5        100        120       160         0
  total dropped: 1840
```

```
to lose nothing
  buffer needed : 2040
  buffer sized  : 200
  short by      : 1840, a factor of 10
  expressed against the average, that is 20 times the mean
  the rule that was applied said 2 times the mean
```

```
what each sizing rule is answering
  2x the average        : how much do I hold when the consumer keeps up
  burst minus drain     : how much do I hold when it does not
  the first is about memory cost, and its answer is 'as little as possible'
  the second is about loss, and its answer has no upper bound in the average
  a buffer that never fills in steady state tells you nothing about either
```

```
control - sustained overload at 180 per second, which the review was arguing about
  excess per second      : 60
  backlog after 60 seconds: 3600 if nothing is dropped
  with a buffer of 200  : fills in 3 seconds, then drops, and the producer learns
  with a buffer of 2040 : fills in 34 seconds, serving data that old before anyone hears
  the small buffer is genuinely better here, exactly as argued
```

```
null control - a burst of 300 per second for 1 second
  arrived        : 300
  drained        : 120
  buffer holds   : 180 of 200
  dropped        : 0
  same buffer, same rule, same consumer, and nothing is lost
  the rule is not wrong in size, it is wrong in what it consulted
```

Twice the average is a real rule with two correct arguments behind it: memory is held permanently, and an oversized buffer hides sustained overload until the data is stale. Both are about sustained load. The other thing a buffer does is absorb a burst, and that is sized by the burst and the drain rate, neither of which is an average. 2400 events arrived in 3 seconds, 560 were absorbed, and 1840 were dropped by a buffer whose depth graph had never left zero.

Verify it yourself:

```bash
pnpm eml run examples/the-buffer-was-sized-for-the-average-and-the-burst-was-the-point/the_buffer_was_sized_for_the_average_and_the_burst_was_the_point.eml
```
