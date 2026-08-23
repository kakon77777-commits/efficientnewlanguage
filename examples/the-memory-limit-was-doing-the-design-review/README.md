# The memory limit was doing the design review

`the_memory_limit_was_doing_the_design_review.eml` - A query memory limit was raised from 4 GB to 16 GB. What the analysts wrote afterwards is computed below, along with what the old limit had been doing.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Raising the limit was correct. Three legitimate quarterly reports could not run at all, the workarounds were worse than the queries - one of them wrote a temporary table and read it back - and the machine had 400 GB sitting idle. Refusing to run a correct report on hardware that can afford it is not a virtue.

The limit was also the only thing anybody consulted about how a query should be shaped. A kill at 4 GB is a review comment delivered by the scheduler: it arrives every time, it cannot be argued with, and it is free. Raising the ceiling removed the report failures and it removed the review.

Queries are counted by the memory they need, before and after.

```
memory needed   attempts/month before   after
  1 GB              210                    190
  2 GB              90                    84
  4 GB              31                    40
  8 GB              0                    46
  16 GB              3                    22
  32 GB              0                    9
```

```
queries attempted a month : 334 -> 391, 117 per 100
limit           : 4 GB -> 16 GB
```

```
queries killed per month
  old workload against the old 4 GB limit : 3
  new workload against the new 16 GB limit : 9
  new workload against the old 4 GB limit : 77
  the kill count came back, against a ceiling four times higher
```

```
average memory per query
  before : 16 tenths of a GB
  after  : 39 tenths of a GB
  multiplied by 23 tenths
total memory demanded per month
  before : 562 GB
  after  : 1526 GB
  attempts rose 17% and memory demanded rose 171%
```

```
the reports that could not run
  quarterly cohort : 9 GB, workaround was a temporary table read back in two passes
  margin by region : 11 GB, workaround was sampling to a tenth and scaling up
  retention curve : 14 GB, workaround was three separate queries joined by hand
  they run now, correctly, in one pass each
  memory they use : 34 GB a month between them
  that is 3% of the increase in memory demanded
```

```
the increase, apportioned
  the three reports the change was for : 34 GB
  everything else                      : 930 GB
  ratio : 27 to 1
  none of the second group was blocked before, so none of it was waiting
  for the change - it is queries that would have been written smaller
```

```
what happened when a query was killed at 4 GB
  the analyst rewrote it     : every time, there was no other option
  time to rewrite            : under an hour, usually a narrower date range
  reviews that comment on query memory : 0
  so the scheduler was the only reviewer, and it reviewed every query
  the same way for free
```

```
queries above each candidate ceiling, on the current workload
  4 GB : 77 killed a month
  8 GB : 31 killed a month
  16 GB : 9 killed a month
  32 GB : 0 killed a month
  the workload reshapes itself around whichever of these is chosen, so the
  kill count is a property of the ceiling and not of the analysis
```

```
control - jobs whose memory is fixed by the input size
  nightly rollup : 6 GB before, 6 GB after
  index rebuild : 12 GB before, 12 GB after
  export : 3 GB before, 3 GB after
  jobs whose memory changed when the ceiling rose : 0 of 3
  none, because nobody chooses these numbers - the data does
  here the ceiling is a safety limit rather than a design constraint,
  and raising it is purely an improvement
```

The three reports really were blocked and their workarounds really were worse than the queries. The limit was also the only review any query got, so 930 GB of the 964 GB increase came from queries nobody had blocked.

Verify it yourself:

```bash
pnpm eml run examples/the-memory-limit-was-doing-the-design-review/the_memory_limit_was_doing_the_design_review.eml
```
