# The clarification arrives after the decision — 3 wrong reviews, and waiting 3 days fixes all of them

`the_clarification_arrives_after_the_decision.eml` replays every decision at its own time and again with everything that eventually arrived.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: This is the version of the problem that survives every fix aimed at content.
The basis is written down, the schema has a field for it, the consumer reads
that field — and the field is filled in by a reconciliation job on a slower
clock than the thing making decisions. The decision maker is never wrong about
what it knew; it is wrong about what was knowable.


```
decisions made at arrival time
  o2 day 1 : amount 400 -> review
  o4 day 2 : amount 500 -> review
  o5 day 3 : amount 300 -> review
  o7 day 4 : amount 700 -> review
  o8 day 5 : amount 260 -> review
  o10 day 6 : amount 900 -> review
  flagged : 6
```

```
the same rule, on the amounts that turned out to be true
  flagged : 3
```

```
lag between arrival and the final amount
  total order-days of lag : 9
  longest lag             : 3
```

```
if every decision waited d days
  wait 0 days : 7 of 10 decisions match the final answer
  wait 1 days : 7 of 10 decisions match the final answer
  wait 2 days : 7 of 10 decisions match the final answer
  wait 3 days : 10 of 10 decisions match the final answer
  wait 4 days : 10 of 10 decisions match the final answer
```

```
control - orders that were never revised
  orders : 7
  where the two decisions agree : 7
  the rule is not the problem
```

The clarifying fact exists, has a field, and is read. It is simply not there
yet at the moment something has to be decided, and no amount of writing the
definition down moves it earlier.

Verify it yourself:

```bash
pnpm eml run examples/the-clarification-arrives-after-the-decision/the_clarification_arrives_after_the_decision.eml
```
