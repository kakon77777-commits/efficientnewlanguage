# The migration ran on the primary and the replica had its own queue

`the_migration_ran_on_the_primary_and_the_replica_had_its_own_queue.eml` - Schema changes use an online tool that never takes a table lock, and three hundred and forty have run with no downtime. Where "no downtime" was measured is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The online migration tool is the right answer and it works. It builds a shadow table, backfills in chunks sized against replication lag, swaps atomically, and never holds a lock long enough to block a write. Every migration is rehearsed against a restored copy of production first. Three hundred and forty changes, no downtime, and the longest ran forty-seven minutes without a single blocked query on the primary.

The tool runs on the PRIMARY. Its work reaches the replicas as replication, which is applied serially, so a forty-seven minute change is forty-seven minutes during which nothing after it can be applied.

Three quarters of reads are served by replicas.

```
migrations run                  : 340
blocked queries on the primary  : 0
longest migration, minutes      : 47
migrations rehearsed against a replica : 0
```

```
reads per minute                : 210000
  served by the primary, percent: 26
  served by replicas, percent   : 74
  replica share                 : 7400 per ten thousand
  replica reads per minute      : 155400
```

```
replica reads during the longest migration : 7303800
checks on replica lag during a migration   : 0
```

```
the online migration
  method : a shadow table, backfilled in chunks sized
    against replication lag, swapped atomically
  locks held long enough to block a write : none
  rehearsed against : a restored copy of production
  migrations run : 340
  blocked queries on the primary : 0
  verdict : NO DOWNTIME ON THE PRIMARY
```

```
  chunk sizes tuned against replication lag show the
  authors were thinking about replicas, and the backfill
  genuinely does not fall behind
```

```
the replicas
  how the change reaches them : the replication stream
  how the stream is applied : serially
  what a long statement does to everything behind it : it
    waits
  so a 47 minute change costs the replicas : 
    47 minutes of lag
  what the backfill's chunking bounded : the backfill
  what it did not bound : the swap
```

```
  the tool measures the primary, correctly, and the
  quantity a reader experiences is on the other side
```

```
a read during that window
  which server answers : a replica, 7400 per ten
    thousand of the time
  how far behind it is : up to 47 minutes
  does the query fail : no
  does it return an error : no
  what it returns : an answer from before the change
  reads in that state, that window : 
    7303800
```

```
the rehearsal
  runs against : a restored copy of production
  what that copy has : the data
  what it does not have : replicas, or read traffic
  migrations rehearsed against a replica : 
    0
  so the rehearsal measures : the primary, faithfully
  checks on replica lag during a migration : 
    0
```

```
null control - the swap is gated on replica lag
  blocked queries on the primary : 0, unchanged
  checks on replica lag during a migration : 
    1
  replica reads served from before the change : 
    0
  the tool did not get better; the definition of done
  moved from one server to the ones serving reads
```

```
what an online migration guarantees
  no query on the primary is blocked : exactly, over
    340 migrations, and the chunking is real engineering
  no query is affected : not addressed; the guarantee is
    stated about the server the tool runs on, and the
    change reaches the others as a serial stream
```

```
downtime is a property of a reader, not of a server; a tool
that eliminates it where it executes has moved the cost to
wherever its output is applied, and that place has its own
queue and no instrument pointed at it
```

The tool builds a shadow table, chunks the backfill against replication lag, swaps atomically and rehearses against restored production - 340 migrations, 0 blocked queries. It runs on the primary and replicas apply serially, so a 47 minute change costs 47 minutes of lag on the servers answering 7400 per ten thousand of reads - 7303800 of them - under 0 checks.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-ran-on-the-primary-and-the-replica-had-its-own-queue/the_migration_ran_on_the_primary_and_the_replica_had_its_own_queue.eml
```
