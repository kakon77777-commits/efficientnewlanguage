# Match predicate not transitive — there is no grouping to be right about

`match_predicate_not_transitive.eml` sweeps **all 24 orderings** of four
records through a single-pass clusterer, counts how many distinct answers come
out, then asks the transitive closure for its answer and checks it against the
predicate that produced it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a record-matching predicate written as "same email, or
same phone, or same name". Each clause is defensible. The conjunction is
reflexive and symmetric and **not transitive**.

```
     p0  p1  p2  p3
p0    1   1   0   0
p1    1   1   1   0
p2    0   1   1   1
p3    0   0   1   1
```

`p0 ~ p1` on a shared household phone. `p1 ~ p2` on a shared mailbox. `p0 ~ p2`
on nothing at all.

Grouping requires an equivalence relation. Given one that is not, there are two
things an implementation can do, and both are wrong in a different way:

| clusterer | distinct answers over 24 orderings |
| --- | --- |
| single pass, first matching cluster wins | **4** |
| transitive closure | **1** |

The four single-pass answers, and how many orderings produce each:

```
0,1,2,3,|   from 8 orderings
0,1,2,|3,|  from 5 orderings
0,1,|2,3,|  from 6 orderings
0,|1,2,3,|  from 5 orderings
```

The answer is a property of the export's row order, not of the people.

The closure is stable, which is why it tends to be the one that gets chosen.
Its single group contains **6 pairs, 3 of which the predicate explicitly says
are not the same person**.

This is not the ordering defect the corpus already covers in
`comparator-not-a-total-order`. A comparator that is not a total order breaks
*sorting*; a match predicate that is not an equivalence relation breaks the
*existence* of the grouping. The dedup job does not have a correct output it is
failing to produce — it has no correct output, and the choice between an
order-dependent answer and an over-merged one was made by whoever wrote the
loop.

Verify it yourself:

```bash
pnpm eml run examples/match-predicate-not-transitive/match_predicate_not_transitive.eml
```
