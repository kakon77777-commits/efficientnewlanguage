# Bounded queue backpressure — a bigger buffer is not more capacity

`bounded_queue_backpressure.eml` runs one burst arrival pattern through
three full-queue policies — drop-newest, drop-oldest, block — at three
queue sizes, and reports loss, stalls, and the age of what was served.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: every policy loses something, and the queue size
chooses *which*, not *whether*.

```
a bigger queue does not create service capacity, it converts loss into delay:
  drop-newest  cap 4 -> 64: dropped 47 -> 0, max age 7 -> 79
```

Throughput is set by the consumer — at one item per 2 ticks over 120 ticks
it can serve at most 61, and the best any policy achieves is 60 — so no
queue size changes how much gets served. Two checks pin the trade in both
directions: a larger queue must drop strictly less, **and** its max age must
rise. A third rejects any run that serves more than the consumer's physical
capacity, which would mean the model is wrong rather than the policy good.

Blocking is lossless at every size and pays for it in producer stalls (112
stalled ticks at capacity 4), which is backpressure travelling upstream
rather than disappearing.

**The observable that separates the two drop policies** is the one a
dashboard usually does not have. At capacity 4 they are identical on drop
count (47 each) and identical on worst-case age (7 each); they differ only
in mean age — 5 versus 2 — because they keep opposite ends of the queue. An
alert on drop rate or on peak latency cannot tell them apart at all, and
that equality is itself a check, so a change that made the counts diverge
would fail rather than quietly invalidate the comparison.

Verify it yourself:

```bash
pnpm eml run examples/bounded-queue-backpressure/bounded_queue_backpressure.eml
```

```bash
pnpm eml trace examples/bounded-queue-backpressure/bounded_queue_backpressure.eml --run
```
