# The migration finished and both writers kept writing

`the_migration_finished_and_both_writers_kept_writing.eml` - The migration from the old store to the new one completed twelve months ago and was signed off. Both stores are still being written to. What is in each of them is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Dual-writing during a migration is correct and the cutover plan was a good one. Writing to both stores means the old one stays a live fallback rather than a frozen snapshot, so a rollback loses nothing. Reads were moved to the new store first and watched for a week before anything else changed. The verification at cutover compared every write path in both stores and found them identical. All of that is textbook.

The dual-write was behind a flag that defaults to on, and the cleanup ticket to remove it was closed as part of a general backlog sweep. That is the whole defect and it costs nothing on the day it happens: both stores still agree.

Divergence does not start when the flag is left on. It starts the first time somebody adds a write path, because a new path is written against the current architecture, which has one store in it. The old store stops receiving what it never knew to expect.

```
paths at cutover, dual-written : 6
paths added since, new store only: 5
```

```
month added   writes/month   months active   records in new store only
  2             800            11              8800
  4             800            9              7200
  6             800            7              5600
  8             800            5              4000
  10             800            3              2400
```

```
old store : 72000 records
new store : 100000 records
divergence: 28000, which is 28 percent of the new store
```

```
the quarterly compliance extract reads the old store
  records it reports : 72000
  records that exist : 100000
  it reports 72 percent of the population and returns no error
  every record it returns is a real record with correct fields
```

```
the dual write itself
  writes sent to the old store  : 72000
  reads served from it in the request path : 0
  so 72000 writes were paid for and 72000 were not read
  the flag costs write latency on every request for twelve months
```

```
control - compare the stores across the paths the migration covered
  old store, original paths : 72000
  new store, original paths : 72000
  difference                : 0
  the migration is verifiably correct, and it is still correct today
  a check aimed at the migration examines exactly the paths that still work
```

```
null control - the same flag left on, no new write paths added
  old store : 72000
  new store : 72000
  divergence: 0
  cost      : 72000 wasted writes, and no wrong answers
  the divergence needs a second event, and that event is ordinary work
```

```
the person who added path 7 in month 2
  wrote against the current architecture      correct
  wrote to the store that reads are served from  correct
  did not write to a store the docs call retired correct
  had no way to know a consumer still read it    the docs said the migration was done
```

```
the cutover checklist
  listed every write path                     complete on the day
  listed every read path                      complete on the day
  named the store that must stop being written    yes, in the cleanup ticket
  survived the closing of that ticket             no
```

Dual-writing keeps the old store a live fallback instead of a frozen snapshot, which is why rollback was safe, and the cutover verification compared every path in both stores and found them identical. It still would: across the 6 paths that existed then, the stores differ by 0. Five paths have been added since, the stores differ by 28000 records, and the quarterly extract has been reporting 72 percent of the population without ever failing.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-finished-and-both-writers-kept-writing/the_migration_finished_and_both_writers_kept_writing.eml
```
