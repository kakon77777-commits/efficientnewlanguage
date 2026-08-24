# The field stopped being null and killed the branch

`the_field_stopped_being_null_and_killed_the_branch.eml` - A nullable field was backfilled and now always has a value. What that did to the code written for the null case is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Backfilling was right. A third of records had no assigned region, every report had to explain a bucket called unknown, and the backfill used the billing address, which is the same source the field was always supposed to come from. The data is better and the reports are simpler.

The null was carrying information: it meant nobody had determined a region yet. Consumers written against that meaning have a branch for it, and after the backfill that branch stops executing. The branch is still there, still compiles, still has its test, and never runs again - so a case that used to be handled is now handled by code that is unreachable.

Records are counted before and after, with what each branch did.

```
state    records   with region   null region
  before   900000     604000       296000
  after   900000     900000       0
```

```
nulls removed : 296000, 32% of all records
```

```
consumer           null branch                              still runs
  tax calculator   applies the default rate and flags for review   no
  shipping quote   asks the user to confirm their region   no
  regional report   counts it in unknown   no
  fraud score   adds risk points for missing data   no
  export   writes an empty string   no
  branches that no longer execute : 5 of 5
  branches deleted : 0
  branches whose tests still pass : 5
```

```
the test suite after the backfill
  tests covering the null branch : 5
  those tests construct a record with a null region themselves
  so they pass, and they are the only place a null region now exists
  a test that builds its own input cannot notice that production stopped
  producing that input
```

```
what a region value meant, before and after
  before, a value : somebody or something determined the region
  before, a null  : nobody had determined it yet
  after, a value  : either of the above
  the field lost the ability to say the second thing, and no field gained
  it
```

```
the fraud score in detail
  its null branch : adds risk points for missing data
  records that used to take it : 296000
  records that take it now     : 0
  a missing region was a weak fraud signal and it was a real one
  the signal is not wrong now, it is absent, and the score does not
  distinguish an absent signal from a negative one
```

```
where the backfilled values came from
  billing address present : 240000 records, 99% accurate
  billing address missing, guessed from IP : 44000 records, 71% accurate
  neither, defaulted to the largest region : 12000 records, 34% accurate
  backfilled records : 296000
  weighted accuracy  : 92%
  wrong values introduced : 23080
  before the backfill those records said nothing; now some of them say
  something incorrect, and nothing marks which
```

```
keeping both facts
  region        : the value, backfilled
  region_source : determined, inferred, or defaulted
  cost : one column
  consumers that could then behave as before : 5
  the fraud score would key on the source rather than on the null, and
  the tax calculator would still flag the defaulted ones for review
```

```
control - currency, non-null since the first release
  records : 900000, with a value : 900000, null : 0
  consumer branches written for its absence : 0
  there is nothing here to make unreachable, because nobody ever had to
  decide what its absence meant
```

The backfill used the right source and the reports are simpler for it. A null meant nobody had determined the region, 5 consumers had a branch for that, and all 5 of them still compile and never run.

Verify it yourself:

```bash
pnpm eml run examples/the-field-stopped-being-null-and-killed-the-branch/the_field_stopped_being_null_and_killed_the_branch.eml
```
