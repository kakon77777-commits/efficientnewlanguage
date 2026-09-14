# Every eligible record was processed and none were eligible

`every_eligible_record_was_processed_and_none_were_eligible.eml` - The nightly job reports 100 per hundred of eligible records processed, and the count is honest. How many records were eligible is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The job is careful. It computes eligibility from the real rule, not a stale flag; it processes every eligible record it finds; it reports the ratio of processed to eligible; and a ratio below 100 pages on-call.

The eligibility filter matched zero records this run, and a ratio of zero over zero is reported as complete.

```
records scanned                 : 500000
records eligible (by the filter): 0
records processed               : 0
reported completion             : 100 per hundred
alerts that fired               : 0
```

```
records the filter excluded     : 500000
records truly eligible, missed  : 1200
```

```
the completion metric
  eligibility : from the real rule, not a stale flag
  processes : every eligible record it finds
  reports : processed over eligible
  pages when : the ratio is below 100
  eligible records left unprocessed : 0
  verdict : 100 PER HUNDRED COMPLETE
```

```
  paging on a ratio below 100 is the part done right
  here, and it is why a real shortfall would alert
```

```
processed over eligible
  eligible this run : 0
  processed this run : 0
  the ratio : zero over zero, reported as complete
  what 100 per hundred of nothing means : every one of
    no records, which is trivially all of them
  what it does not mean : that the work was done
```

```
the eligibility filter
  what it matched this run : 0
  why : a predicate that excludes everything after an
    upstream schema change renamed the field it reads
  records that were truly eligible : 
    1200
  did the ratio notice they were skipped : no; they were
    never in the denominator
  is the completion figure false : no; it is vacuously
    true
```

```
null control - an empty eligible set is not 100 percent
  completion when empty reads as 100 : 
    100
  completion when empty is undefined : 
    0
  alerts on zero eligible : 1
  no record changed; an empty denominator stopped being
  reported as a finished job
```

```
what 100 per hundred processed guarantees
  every eligible record was processed : exactly, none was
    left unprocessed
  the work was done : not addressed; the eligible set was
    empty, and 'all of an empty set' is vacuously true - 
    1200 records that should have been eligible were
    never counted, and 100 per hundred of zero fired no
    alert
```

```
a universal claim over an empty set is true and says nothing; 'all eligible
records processed' is satisfied most completely when nothing is eligible, which
is exactly when the least work was done
```

It computes eligibility from the real rule, processes every eligible record, and pages below 100 - a true 100 per hundred. The filter matched zero, so the ratio is zero over zero, reported complete: 1200 truly-eligible records went unprocessed under 0 alerts, because none were in the denominator.

Verify it yourself:

```bash
pnpm eml run examples/every-eligible-record-was-processed-and-none-were-eligible/every_eligible_record_was_processed_and_none_were_eligible.eml
```
