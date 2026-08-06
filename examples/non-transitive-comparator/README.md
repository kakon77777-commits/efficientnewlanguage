# Non-transitive comparator — three answers, and the postcondition likes all of them

`non_transitive_comparator.eml` runs three sorting algorithms over every
permutation of a comparator with a three-element cycle, and counts distinct
outputs.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: sorting requires a total order. Most hand-written
comparators are not one, and the failure is not an exception — it is a result.

| input | insertion | selection | bubble |
| --- | --- | --- | --- |
| ABC | ABC | CAB | ABC |
| ACB | CAB | BCA | CAB |
| BCA | BCA | ABC | BCA |

18 runs, **3 distinct outputs**. Antisymmetry holds on 9/9 pairs — the property
a unit test would check — and transitivity holds on **0/3** chains.

**The measurement corrected the premise this file was written on.** The obvious
defence is a postcondition: sort, then assert the result is sorted. That
assertion passes on **18 of 18** runs, because the usual is-sorted check tests
adjacent pairs and with a three-cycle every rotation has all of its adjacent
pairs in order. So the check written to catch exactly this cannot separate the
three answers.

Comparing **all** pairs rather than neighbours passes on **0 of 18**. Both
counts are now checks, so the defence's blind spot is pinned as tightly as the
comparator's.

The control: the same three algorithms over the same permutations, ordered by
name, give exactly **1** output.

Verify it yourself:

```bash
pnpm eml run examples/non-transitive-comparator/non_transitive_comparator.eml
```

```bash
pnpm eml trace examples/non-transitive-comparator/non_transitive_comparator.eml --run
```
