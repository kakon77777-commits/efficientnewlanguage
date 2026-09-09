# The migration was complete over the rows that could be migrated

`the_migration_was_complete_over_the_rows_that_could_be_migrated.eml` - The migration reported complete after eleven months, and the work behind that report was done properly. What complete was measured against is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The migration was run well. Every batch was checksummed on both sides rather than counted; the application dual-wrote for forty-five days and the two stores were compared row by row during it; the rollback was rehearsed four times against a restored copy of production; and the cutover happened only after a week in which the new store served reads with the old one still authoritative.

A row the target would not accept was routed to a review table and taken out of the total the report divides by.

```
source rows                     : 41800000
  migrated                      : 41246000
  routed to needs_review        : 554000
  the report's denominator      : 41246000
```

```
completeness, as reported       : 10000 per ten thousand
completeness, against source    : 9867 per ten thousand
  distance between them         : 133 per ten thousand
```

```
rows refused in total           : 554000
  null in a now-required column : 318000
  foreign key with no parent    : 173000
  dated before the target allows: 63000
```

```
months of work                  : 11
batches checksummed both sides  : 8360
days of dual write              : 45
rollback rehearsals             : 4
needs_review rows examined since: 0
```

```
the migration
  per batch : a checksum on both sides, not a count,
    8360 times
  dual write : 45 days, with the two stores compared row
    by row throughout
  rollback : rehearsed 4 times against a restored copy of
    production
  cutover : after a week of the new store serving reads
    with the old one still authoritative
  verdict : COMPLETE
```

```
  checksumming each batch rather than counting it is the
  part almost nobody does, and it is why no migrated row
  is in doubt
```

```
the two ways to divide
  rows the report counted : 41246000, which is the source
    minus the rows the target refused
  rows migrated : 41246000
  so the reported figure : 10000 per ten thousand
  could it have been lower : only if a row that passed
    the target's constraints had been left behind, and
    the checksums say none was
  against the source instead : 9867 per ten thousand
```

```
  a refused row leaves the denominator at the moment it
  becomes the kind of row that would have lowered it
```

```
needs_review
  rows : 554000
  are they lost : no; they are in a table, in the new
    store, with their original values
  is anything reading them : 0 rows examined since
    cutover
  does the old store still exist : no; it was
    decommissioned when the report was accepted
  what a customer whose row is there sees : an account
    that predates the change and no longer resolves
```

```
null control - divide by the source, give the table an owner
  batches checksummed : 8360, unchanged
  denominator : 41800000
  rows migrated : 41246000
  completeness : 9867 per ten thousand
  rows with somebody responsible for them : 554000
  no row moved; the total it was compared against
  stopped being defined by what moved
```

```
what a complete migration guarantees
  every row the target would accept is in the target :
    exactly, checksummed per batch, 45 days of dual
    write, 4 rehearsals
  every row is in the target : not addressed; a row the
    target refused was removed from the total before the
    division
```

```
a completion figure whose denominator excludes the
failures reaches one hundred percent as a matter of
arithmetic; the rows that were left are in a table nobody
divides by
```

Every batch was checksummed on both sides, the application dual-wrote for 45 days with row-by-row comparison, and the rollback was rehearsed 4 times. Rows the target refused were routed out of the denominator, so completeness reads 10000 per ten thousand against 9867 over the source - 554000 rows apart - and 0 of them have been looked at since the old store was decommissioned.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-was-complete-over-the-rows-that-could-be-migrated/the_migration_was_complete_over_the_rows_that_could_be_migrated.eml
```
