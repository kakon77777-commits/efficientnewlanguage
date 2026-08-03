# Most pairs right, and the ones that matter inverted

`event_order_without_clock.eml` reconstructs an event order from timestamps written by two clocks that disagree, and checks it against causality.

**What it exercises**: sorting by wall clock gets most adjacent pairs
right and inverts every cause/effect pair, because node B's clock runs
5 ms behind. The log still reads as a story. Two events also share a
millisecond, so the wall clock has 6 distinct values for 8 events.

The finding is what adding a tiebreak buys. Sorting by (timestamp, node)
makes the order **deterministic** and does not fix causality — the same
wrong answer every time is still the wrong answer. The two properties
get conflated because both are described as "a stable ordering".

A Lamport counter recovers causality and loses elapsed time. Neither
ordering recovers both, which is why the choice has to be made against
the question being asked.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
distinct wall-clock values:        6 for 8 events
distinct lamport values:           8

what survives:
  wall clock recovers real elapsed time:  True
  wall clock recovers causality:          False
  lamport recovers causality:             True
  lamport recovers elapsed time:          False

checks passed: 5/5
A skewed clock orders most pairs correctly and inverts the ones that matter.

Adding the node id as a tiebreak makes the ordering DETERMINISTIC, which
feels like progress and fixes nothing: the same wrong answer every time is
still the wrong answer. The two properties get conflated because both are
described as 'a stable ordering', and only one of them is about causality.
```
