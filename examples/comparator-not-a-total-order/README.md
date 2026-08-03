# Sorted twelve different ways

`comparator_not_a_total_order.eml` sorts one multiset under three comparators, over every permutation of the input, and counts the distinct answers.

**What it exercises**: "equal if within 0.5" is not transitive —
1.0 ~ 1.4 and 1.4 ~ 1.8, but 1.0 and 1.8 are not. Equality has stopped
being an equivalence relation, and the sort's output now depends on the
order the elements arrived in. Measured: the strict comparator gives
**1** answer over 24 permutations, the tolerant one gives **12**, and
every one of those 12 passes an "is it sorted?" check by its own
comparator.

The repair is the interesting part, because this file expected the wrong
thing. Quantising to a grid fixes transitivity and does **not** give
back a unique answer — it gives a total *preorder*, ties are real, and a
stable sort keeps tied elements in arrival order. So it yields 2 results,
not 1.

What it does yield consistently is the **bucket sequence** — the run of
equivalence classes, which is well defined precisely because equality is
now transitive. That is the guarantee actually available, and the
tolerant comparator cannot offer it at any price.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  1.8 1.4 1.0 1.1          1
  1.8 1.4 1.1 1.0          1

results that pass "is it sorted?" by their own comparator: 24/24
...which is why the order check is not the check.

checks passed: 5/5
One multiset, one comparator, twelve answers - all of them 'sorted'.

A tolerance turns equality into a relation that is reflexive and symmetric
but not transitive, and a sort needs all three. Quantising fixes transitivity
and does NOT give back a unique answer - ties remain, and a stable sort keeps
them in arrival order. The guarantee you can actually buy is that the
equivalence classes are the same every time, which is what makes the result
reproducible once you also fix the tie order. Expecting one answer from the
repair was this file's own first premise.
```
