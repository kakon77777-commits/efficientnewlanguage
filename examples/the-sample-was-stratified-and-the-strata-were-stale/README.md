# The sample was stratified and the strata were stale

`the_sample_was_stratified_and_the_strata_were_stale.eml` - The quality sample is stratified with proportional allocation and weighted estimation, reviewed by a statistician. What the weights reconstruct is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The sampling design is the good kind. It is not a convenience sample of whoever answers; the population is partitioned into twelve strata by region and plan tier, allocation is proportional to stratum size, every estimate is weighted back to the population, and the whole design was reviewed by a statistician who checked the estimator and the variance calculation.

The weights encode the stratum SIZES, and the sizes came from a snapshot of the population taken when the design was written. The design has not changed since, which is correct for a design and wrong for a measurement of a moving population.

That snapshot is fourteen months old.

```
strata                          : 12
sampled per quarter             : 4800
statistician reviews of the design : 1
months since the population snapshot : 14
refreshes of the stratum sizes  : 0
```

```
accounts at the snapshot        : 240000
accounts now                    : 412000
  added since                   : 172000
```

```
self-serve share, weight in use : 3083 per ten thousand
self-serve share, actual now    : 5194 per ten thousand
  error in the weight           : 2111 per ten thousand
```

```
the sampling design
  population partitioned into strata : 12
  allocation : proportional to stratum size
  estimates weighted back to the population : yes
  estimator and variance reviewed : by a statistician
  verdict : STRATIFIED
```

```
  a stratified design beats a convenience sample by a wide
  margin and this one is correctly specified
```

```
one weight
  what it encodes : the share of the population in this
    stratum
  where that share came from : a snapshot of the population
  when that snapshot was taken : 14 months ago
  what the estimate is therefore unbiased for : the
    population as it was then
  how often the design says to refresh it : the design is a
    design; it says how to weight, not when to re-measure
```

```
  the estimator is unbiased and the population it is
  unbiased for is not the one being reported on
```

```
what the quarterly report can check
  response rate per stratum : computed, healthy
  achieved allocation vs target : matches
  margin of error : computed from the design
  design effect   : computed from the design
  stratum sizes vs the current population : not computed
  the check that would show it : one query against the
    accounts table, which nothing runs
```

```
the effect on one estimate
  self-serve accounts then : 74000
  self-serve accounts now  : 214000
  weight applied to them   : 3083 per ten thousand
  weight they should carry : 5194 per ten thousand
  the estimate is : precise, and about the population of
    14 months ago
```

```
null control - stratum sizes recomputed each quarter
  strata and allocation rule : unchanged
  weight in use       : 5194 per ten thousand
  error in the weight : 0 per ten thousand
  the design did not improve; the quantity it reads was
  read again
```

```
what a stratified sample guarantees
  unbiased estimates for the population the weights
    describe : exactly, and demonstrably
  unbiased estimates for the current population : not
    addressed; the weights are data, and this design has
    no step that re-reads them
```

```
a sampling design is a function of the population it was
written against; reviewing the method proves the method and
leaves the parameter unexamined, because a parameter is not
part of a method
```

The design is properly stratified - 12 strata, proportional allocation, weighted estimation, reviewed by a statistician - and every diagnostic it computes is green. Its weights come from a population snapshot 14 months old, refreshed 0 times since, over which the account base went from 240000 to 412000, so the self-serve stratum is weighted at 3083 per ten thousand instead of 5194 - an error of 2111 per ten thousand in a quantity nothing recomputes.

Verify it yourself:

```bash
pnpm eml run examples/the-sample-was-stratified-and-the-strata-were-stale/the_sample_was_stratified_and_the_strata_were_stale.eml
```
