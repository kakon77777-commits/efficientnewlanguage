# The migration was online and the reads took a lock

`the_migration_was_online_and_the_reads_took_a_lock.eml` - The migration is online, took forty milliseconds, and rewrote nothing. How long the table was unavailable is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The migration is genuinely online. Adding a nullable column with no default does not rewrite the table, does not scan it, and does not hold a lock while any data is touched. The documentation says so, the staging run took forty milliseconds against a copy of production, and the operator who chose this form of the change chose it for exactly this reason.

It still needs the catalog for an instant, and taking that lock means QUEUEING for it. The queue is ordered, so everything that arrives after the waiting migration waits behind the migration, not behind the operation the migration is waiting for.

A reporting query had been running for five and a half minutes.

```
alter duration, ms         : 40
rows rewritten             : 0
rows scanned               : 0
```

```
the reader it queued behind, seconds : 340
outage, seconds            : 340
requests queued            : 1054000
the wait is the work times : 8500
```

```
the migration's own properties
  table rewritten     : no
  table scanned       : no
  lock held while touching data : none, there is no data step
  duration, ms        : 40
  staging run against a production copy : 40 ms
  verdict             : ONLINE
```

```
  every line is true and the operator was right to prefer
  this form over the one that rewrites
```

```
acquiring the catalog lock
  lock needed for, ms   : 40
  granted immediately   : only if nothing holds a
    conflicting lock
  what held one         : a reporting query, 340 s in
  the queue is ordered  : yes
  who waits behind the waiting migration : everyone
```

```
  the duration of an operation and the duration of getting
  to run it are unrelated quantities
```

```
the three participants
  the reporting query : allowed to run long, and does
  the lock queue      : fair, first in first out
  the migration       : 40 ms of work
  the defect          : none of the three
```

```
share of the following hour spent queued : 8500 per ten thousand
```

```
null control - the migration takes a 3 second lock timeout
  rows rewritten     : 0, unchanged
  outage, seconds    : 3
  requests queued    : 9300
  the migration did not get faster; it stopped being able
  to hold the door open for everyone behind it
```

```
what an online migration guarantees
  no rewrite, no scan, no long data lock : exactly
  the table stays available              : not addressed;
    availability depends on what is already holding a
    lock, which is a property of the traffic and not of
    the migration
```

```
a fast operation in a fair queue is a slow operation for
everyone behind it; the number to check before running one
is not its duration but the oldest transaction open
```

The migration is online and took 40 ms with 0 rows rewritten and 0 scanned, which is what it promises and why it was chosen. It queued behind a reporting query 340 seconds in, and the lock queue is fair, so 1054000 requests waited behind it - 8500 per ten thousand of the following hour - for a wait 8500 times the length of the work.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-was-online-and-the-reads-took-a-lock/the_migration_was_online_and_the_reads_took_a_lock.eml
```
