# The independent check is a translation — measured by where it agrees

`the_independent_check_is_a_translation.eml` compares three implementations and
finds the measurement that separates a second opinion from a transcription.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: implementation B was commissioned as a cross-check and
written by reading implementation A. Everybody knows this and nobody thinks it
is a problem — a different person, a different file, the same understanding.
Implementation C was written from the specification text.

```
dataset                  A    B    C   determined
  quiet week : 50  50  0   1
  one clear miss : 25  25  25   1
  eight orders, one late : 13  13  12   0
  all on the line : 100  100  0   1
  nothing shipped at all : 0  0  -1   0
  mixed : 83  83  50   1

agreement over all 6 datasets
  A and B : 6
  A and C : 1
  A and B never disagree, which is what a cross-check is supposed to show
```

**The number that separates lineage from correctness is not the agreement rate.
It is where the agreement falls.** Split the datasets by whether the
specification determines an answer at all — the spec is silent about rounding at
an exact half and about what to report for zero orders:

```
datasets the specification DOES determine : 4
  A and B agree : 4 of 4
  A and C agree : 1 of 4

datasets the specification does NOT determine : 2
  A and B agree : 2 of 2
  A and C agree : 0 of 2

On every input where the specification says nothing, the two
cross-checking implementations invented the same answer.
```

Two independent implementations must each *invent* an answer where the spec is
silent, and inventions rarely match. Two implementations with one lineage
inherit the same invention. Agreement on determined inputs is evidence about
correctness; agreement on undetermined inputs is evidence about provenance.

**And the defect the cross-check was supposed to catch was there the whole
time** — A counts an order shipped exactly on the promised day as late:

```
datasets where A and C differ, and why
  quiet week : late count 0 by the spec, 2 by A
  all on the line : late count 0 by the spec, 3 by A
  mixed : late count 3 by the spec, 5 by A
  eight orders, one late : same late count, different reporting rule
  total: 5
```

Nothing is declared: each dataset is classified by the specification's own late
count, and every pair of implementations is compared on both populations.

Verify it yourself:

```bash
pnpm eml run examples/the-independent-check-is-a-translation/the_independent_check_is_a_translation.eml
```
