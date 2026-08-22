# The speedup changed a race that had always won

`the_speedup_changed_a_race_that_had_always_won.eml` - Two writers have always raced and one has always won by a wide margin. What the margin was, and what a speedup on the other side does to it, are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The speedup is correct work. The slow path was profiled, the fix is sound, and nothing about it is careless. It also does not touch the ordering: neither writer takes a lock, because in the four years this has run the order has never once come out the other way.

"Never once" is a measurement of the margin, not of the guarantee. A race with a 300 ms margin and a race with a 2 ms margin are the same race with the same absent lock, and only one of them has ever been observed to invert.

The margin is computed at each version.

```
version                  A at   B at   margin   inversions seen
  v1   340ms   40ms   300ms      0
  v2   300ms   40ms   260ms      0
  v3   210ms   40ms   170ms      0
  v4 after the speedup   44ms   40ms   4ms      0
```

```
the margin has gone from 300ms to 4ms
  a reduction of 98%
```

```
inversions observed across every version : 0
  the evidence for the ordering is identical at every margin, because
  the evidence is an absence and an absence does not have a size
```

```
delays that can happen to A on any run
  a GC pause : 15ms, inverts at v1 no, inverts at v4 YES
  a slow disk flush : 30ms, inverts at v1 no, inverts at v4 YES
  a noisy neighbour : 25ms, inverts at v1 no, inverts at v4 YES
  a page fault storm : 60ms, inverts at v1 no, inverts at v4 YES
  a network retransmit : 200ms, inverts at v1 no, inverts at v4 YES
```

```
jitters the old margin absorbed : 5 of 5
jitters the new margin absorbs  : 0 of 5
  the speedup moved 5 of them from harmless to order-inverting
```

```
what a test run establishes
  runs in CI per day : many
  inversions seen    : 0
  CI machines are quiet, so the jitters above are the ones CI does not have
  the suite is measuring the margin under the conditions least likely to
  close it
```

```
ordering the two writers explicitly
  cost : one lock, held across two writes
  what it removes : the dependence on the margin entirely
  when it was cheapest to add : v1, when the margin was 300ms and
  the change would have been invisible in every measurement
  when it becomes visible : now, when it is a regression against v4
```

```
control - the same two writes through a single ordered queue
  margin that the order depends on : none
  effect of any speedup on the ordering : none
  the difference is not how careful anyone was; it is whether the ordering
  is a consequence of timing or of structure
```

The speedup is correct and the order has never inverted in four years. The absence of an inversion is the same observation at every margin, and the margin is what the speedup changed.

Verify it yourself:

```bash
pnpm eml run examples/the-speedup-changed-a-race-that-had-always-won/the_speedup_changed_a_race_that_had_always_won.eml
```
