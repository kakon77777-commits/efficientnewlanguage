# Back-to-back is not an overlap

`interval_overlap_detector.eml` decides whether two time intervals overlap, and the whole case is one comparison operator.

**What it exercises**: `a[0] < b[1] and b[0] < a[1]` is correct.
`<=` is not, and the difference appears exactly when one meeting ends at
the minute the next begins - which in a real calendar is the single most
common adjacency there is, not an edge case.

A `<=` predicate reports every back-to-back pair as a conflict. The
usual response is not to fix the comparison but to weaken something
downstream - a tolerance, a filter, a special case - because the
comparison itself looks obviously right.

The predicate is checked against a minute-by-minute count computed
independently over all 21 pairs: two intervals overlap if and only if
they share at least one minute. The `<=` form gets 3 of them wrong and a
one-way `a[0] < b[1]` gets 13.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
predicate matches shared-minutes:  21/21
back-to-back adjacencies:          3
the <= version got wrong:          3
the one-way version got wrong:     13

The pair that decides it - standup ends exactly when design review begins:
  correct  a[0] < b[1] and b[0] < a[1] : False
  <= form  a[0] <= b[1] and b[0] <= a[1]: True
  minutes actually shared:               0

The predicate matches a minute-by-minute count on every pair.

Back-to-back is the most common adjacency in a real calendar, not an edge
case. A <= in the predicate makes every normal schedule look like a
conflict, which is usually 'fixed' by weakening something else instead of
by correcting the comparison.
```
