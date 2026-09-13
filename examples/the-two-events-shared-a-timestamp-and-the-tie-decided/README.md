# The two events shared a timestamp and the tie decided

`the_two_events_shared_a_timestamp_and_the_tie_decided.eml` - Conflicts are resolved last-write-wins by timestamp, and the timestamps are real and correct. What resolution the timestamp has, against how close the events were, is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The resolution rule is sound. Every event carries a server timestamp from one clock, not many; the clock is monotonic and correct; last-write-wins is applied consistently; and the resolved value is logged with the timestamp that won.

The timestamp has millisecond resolution, and the cause and its effect landed in the same millisecond.

```
events in the day               : 5000000
timestamp resolution            : 1 millisecond
clocks in play                  : 1
events that shared a tick       : 2
  the tie broke correctly for   : 1
  it kept the earlier value in  : 1
```

```
the last-write-wins rule
  timestamp source : one server clock, not many
  the clock : monotonic and correct
  applied : consistently, every conflict
  logged : the resolved value with the winning timestamp
  conflicts resolved by a wrong clock : 0
  verdict : LATER WRITE KEPT
```

```
  one clock rather than comparing timestamps across hosts
  is the part done right here, and it is why skew is not
  the problem
```

```
the two events in one tick
  the cause : written first
  the effect : written microseconds later
  their timestamps : identical, to the millisecond
  what last-write-wins needs : which came later
  what the timestamp provides : that they are the same
    time
  how the tie is broken : by arrival order at the store,
    which is not causal order
```

```
the pair the tie broke wrongly
  what should have won : the effect, the later write
  what won : the cause, because the tie-break put it last
  the value kept : the earlier one
  is any timestamp wrong : no; both are the real time,
    to the millisecond
  is the millisecond fine enough to order them : no
```

```
null control - order by an assigned sequence number
  pairs the timestamp could not order : 
    1
  pairs the sequence cannot order : 
    0
  resolutions that flip : 1
  no event and no clock changed; ordering stopped relying
  on a timestamp too coarse to separate them
```

```
what last-write-wins guarantees
  the write with the later timestamp is kept : exactly,
    one correct clock, applied consistently
  the later event is the one kept : not addressed;
    timestamps have 1ms resolution and the two events
    shared a tick - the tie broke by arrival order and kept
    the earlier value in 1 pair
```

```
a timestamp orders events only as finely as it resolves them, and two events
inside one tick are simultaneous to it; last-write-wins then chooses by
whatever breaks the tie, and a tie-break is not a clock
```

It resolves conflicts by one correct monotonic clock, applied consistently - the later timestamp kept. Resolution is 1ms and a cause and its effect shared a tick, so the tie broke by arrival order and kept the earlier value in 1 of 2, under 0 extra clocks to blame.

Verify it yourself:

```bash
pnpm eml run examples/the-two-events-shared-a-timestamp-and-the-tie-decided/the_two_events_shared_a_timestamp_and_the_tie_decided.eml
```
