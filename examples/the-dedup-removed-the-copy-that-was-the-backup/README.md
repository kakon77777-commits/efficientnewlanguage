# The dedup removed the copy that was the backup

`the_dedup_removed_the_copy_that_was_the_backup.eml` - Duplicate storage was removed and 40% of the bill went with it. What each duplicate had been doing is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Removing duplicates is right and the savings are real. The same records were stored in several places, nobody had designed that, it grew from three integrations written by three teams, and consolidating on one copy is the correct architecture. The bill really did fall.

Some of those copies were being read. A copy that is read is not a duplicate in the sense the cleanup meant - it is a second source that somebody depends on, and whether a copy is one or the other is a fact about its readers rather than about its contents.

Every copy is classified by who read it.

```
copies of the same records : 5, 2000 GB
copies with zero reads     : 0
copies with at least one reader : 5
```

```
copy               GB    reads/month   reader             used for
  primary   400   900000        the app   serving
  analytics mirror   400   12000        the warehouse   reporting
  backup snapshot   400   4        the restore drill   recovery
  legacy export   400   30        the finance close   reconciliation
  search shard   400   60000        the search tier   serving
```

```
a cleanup rule that deletes copies under 1000 reads a month
  copies deleted : 2, 800 GB
  which is 40% of the storage
  deleted : backup snapshot (4 reads, used for recovery)
  deleted : legacy export (30 reads, used for reconciliation)
```

```
reads per month, and what the reader would do without the copy
  primary : 900000 reads, without it -> the request fails
  analytics mirror : 12000 reads, without it -> reports run against the serving store
  backup snapshot : 4 reads, without it -> no restore is possible
  legacy export : 30 reads, without it -> the close cannot be signed
  search shard : 60000 reads, without it -> the request fails
  the two lowest read counts belong to the two whose absence is worst,
  because recovery and reconciliation are rare by design
```

```
the two rankings
  fewest reads : backup snapshot at 4 a month
  what it is   : the only thing that makes the other four restorable
  a rule ordered on reads deletes it first
```

```
what distinguishes a duplicate from a second source
  identical contents : both
  low read count     : both, often
  has a named reader with a purpose : only the second
  copies here with a named reader : 5 of 5
  all of them, so on this criterion the cleanup deletes nothing, which is
  the honest answer for this data set
```

```
where the redundancy really is
  serving copies : 
    2, and they have different access patterns
  the consolidation opportunity is between the two serving copies, which
  are the two with the HIGHEST read counts and the ones a read-based rule
  would keep
```

```
control - abandoned import, 0 reads, reader: nobody
  no reader, no purpose, 400 GB
  here the read count and the purpose point the same way, and this is
  the case the cleanup rule was written from
```

Consolidating storage nobody designed is the right architecture and the saving is real. A read count measures how often a copy is needed, and recovery and reconciliation are rare on purpose.

Verify it yourself:

```bash
pnpm eml run examples/the-dedup-removed-the-copy-that-was-the-backup/the_dedup_removed_the_copy_that_was_the_backup.eml
```
