# Four readings of one sentence, differing on two values

`boundary_inclusive_or_not.eml` compares the four interval conventions and checks the property consecutive ranges need.

**What it exercises**: "between 100 and 200" has four defensible
readings. Over 301 values they agree on 299 and disagree on exactly the
two endpoints — both round numbers, both the kind a person types as a
test case.

The failure that matters is in sequences. Buckets 0-100, 100-200,
200-300 built from closed intervals **double-count** 2 values; built
from open ones they **drop** 4. Both produce a report whose parts do not
sum to the total, off by exactly the number of records on a boundary.

The partition check — every value in exactly one bucket — is the
property, and no single predicate can state it. Half-open is the only
convention that partitions, and it still drops the final endpoint, so
the last bucket needs an explicit closed upper edge.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

a report over 9 orders:
kind         b0   b1   b2   total  matches
closed       4    5    4    13     False
half-open    2    3    3    8      False
open         1    1    1    3      False
left-open    3    3    2    8      False

checks passed: 5/5
Four readings of one sentence, differing on two values, both of them round.

Half-open is the convention that makes consecutive ranges partition, which
is why it is the right default - and it still drops the final endpoint,
so the last bucket needs an explicit closed upper edge. The ambiguity is
not removed by picking a convention; it is removed by writing the bounds
down where a reader can see which one was picked.
```
