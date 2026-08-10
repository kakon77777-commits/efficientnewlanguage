# Each stage verified, nobody verified the seam — three green checks and 130 units of missing money

`each_stage_verified_nobody_verified_the_seam.eml` runs a three-stage pipeline
over six billing rows, evaluates each stage's own check, and then asks what
happened to the money.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: normalisation owns a check about row count.
Deduplication owns a check about names. Totalling owns a check about the
numbers it was handed. Every one of the three is true.

```
stage checks, each written by the stage's own author
  normalise keeps the row count : 1
  dedup output names distinct   : 1
  total sums what it was given  : 1
```

And the pipeline loses money:

```
per-stage ledger (money carried out of each stage)
  into the pipeline   : 360
  after normalise     : 360
  after dedup         : 230

end to end, money lost: 130
```

**The composition detail that makes it survive review.** Deduplication run
against the raw input — which is exactly what a fixture written by dedup's
author contains — drops nothing at all:

```
dedup run on the RAW input, which is what its own fixture holds
  rows in  : 6
  rows out : 6
  money out: 360
  lost     : 0
```

Raw names are distinct. Dedup only starts dropping once normalisation has run
in front of it, and normalisation is not part of dedup's test. Its test is
honest, passing, and blind to the only input it will ever meet in production.

**No check is wrong; the failing property has no owner.**

```
checks that mention money at all:
  normalise's check is about count : 0
  dedup's check is about names     : 0
  total's check is about its input : 0
```

Money conservation is not a property of any single stage, so no stage author
was ever in a position to write it down.

**A fourth check is not the fix.** A dedup that merges instead of dropping
conserves the total:

```
dedup that MERGES instead of dropping
  rows out : 3
  money out: 360
  lost     : 0
```

and — measured, not assumed — both dedups return the same number of rows, so
the obvious guard would not have separated them:

```
both dedups return the same number of rows, so a row-count check cannot tell them apart
```

Verify it yourself:

```bash
pnpm eml run examples/each-stage-verified-nobody-verified-the-seam/each_stage_verified_nobody_verified_the_seam.eml
```
