# Tolerance equality — no implementation is wrong, because nothing is right

`tolerance_equality_grouping.eml` groups values under a "close enough to be the
same" relation two ways, over several orderings of the same input.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: deduplication by tolerance defines a relation that is
reflexive and symmetric and **not** transitive, so it does not partition
anything — and "the group containing x" does not name anything.

```
reflexive on 6/6 values
symmetric on 36/36 pairs
transitive on 36/44 chains
```

Two out of three, and the missing one is the one that makes groups exist. The
two that hold are exactly the properties a test would check.

Two implementations, two answers on the same input: first-match-wins finds
**3** groups, chaining finds **1** (the chain connects 10 to 20 through steps
each within the tolerance).

**A premise this file was written on turned out to be wrong, and the wrong
version was the reassuring one.** Across four orderings of the same six values:

```
distinct group COUNTS from the same input:     1
distinct group MEMBERSHIPS from the same input: 3
```

The **count is stable** and the answer is not. A monitor watching "how many
clusters did we find" reports a perfectly steady number while the clusters
themselves are reshuffled. The file now measures the partition — rendered
canonically as the smallest member of each group, so the signature does not
depend on input order — alongside the count rather than instead of it.

The control: on well-separated values both implementations agree at 4 groups,
which is the fixture everybody writes.

Verify it yourself:

```bash
pnpm eml run examples/tolerance-equality-grouping/tolerance_equality_grouping.eml
```

```bash
pnpm eml trace examples/tolerance-equality-grouping/tolerance_equality_grouping.eml --run
```
