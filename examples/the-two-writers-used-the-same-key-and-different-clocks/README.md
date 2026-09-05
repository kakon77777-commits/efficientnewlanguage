# The two writers used the same key and different clocks

`the_two_writers_used_the_same_key_and_different_clocks.eml` - Conflicts resolve deterministically by last-write-wins and both hosts run a disciplined clock. How often the later write loses is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The resolution rule is deterministic and that matters. Every replica applies the same comparison and converges on the same value, so there is no split brain and no operator has to choose; the alternative considered was a merge function, which the data model cannot support. Clocks are disciplined and the monitored offset stays under forty milliseconds.

Last-write-wins compares TIMESTAMPS. Two writes are ordered by whichever host's clock read higher, and for two writes closer together than the offset between those clocks that is not the order they happened in.

Conflicting writes are a median of twelve milliseconds apart.

```
writes per day                   : 8400000
conflicting pairs per day        : 24000
median gap between them, ms      : 12
monitored clock offset, ms       : 40
```

```
pairs the clocks can order       : 4400
pairs closer than the offset     : 19600
of those, resolved backwards     : 9800
share of conflicts resolved backwards : 4083 per ten thousand
divergent replicas               : 0
```

```
last-write-wins
  every replica applies the same comparison : yes
  replicas converge on the same value       : yes
  divergent replicas observed               : 0
  an operator has to choose                 : never
  the alternative considered : a merge function the data
    model cannot support
  verdict : CONVERGENT
```

```
  determinism is real and it is what makes this operable
```

```
the two operands
  a timestamp from host A : A's clock
  a timestamp from host B : B's clock
  what makes them comparable : an assumption that the
    offset between the clocks is smaller than the gap
    between the writes
  is that assumption monitored : the offset is; the gap
    is not
```

```
  the clock discipline is good and the quantity it is
  good enough for is the one nobody measured
```

```
the outcome for one backwards pair
  replicas agreeing on the value : all
  the value they agree on        : the earlier write
  a log line saying so           : none, both writes
    succeeded and neither is an error
  how a user notices             : their edit is gone
```

```
null control - a version vector instead of a wall clock
  divergent replicas      : 0, unchanged
  pairs resolved backwards: 0
  pairs reported concurrent : 19600, which is what they are
  the rule did not become more deterministic; the ordering
  stopped coming from two unrelated clocks
```

```
what last-write-wins guarantees
  every replica converges on one value : exactly
  that value is the last write         : not addressed;
    the comparison is between two clocks, and two clocks
    order two events only when they are further apart
    than the clocks are
```

```
a conflict rule can be perfectly deterministic and still be
deciding on the wrong quantity; clock discipline bounds the
error and the writes have to be further apart than the bound
```

The rule is deterministic and every replica converges - 0 divergences, no operator ever chooses. It compares two hosts' clocks, monitored to within 40 ms, against conflicting writes a median of 12 ms apart, so 19600 pairs a day are closer together than the clocks are and about 9800 of them - 4083 per ten thousand of conflicts - converge on the earlier edit.

Verify it yourself:

```bash
pnpm eml run examples/the-two-writers-used-the-same-key-and-different-clocks/the_two_writers_used_the_same_key_and_different_clocks.eml
```
