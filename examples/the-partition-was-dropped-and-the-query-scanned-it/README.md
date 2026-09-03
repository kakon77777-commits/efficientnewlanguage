# The partition was dropped and the query scanned it

`the_partition_was_dropped_and_the_query_scanned_it.eml` - Retention dropped three hundred and ten partitions and the query got four times faster. What it still scans is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The retention job is right. Dropping a partition is a catalog operation rather than a delete, so it is instant and reclaims the storage whole; the policy is ninety days and it is the policy the data is licensed under; and the query time fell from thirteen and a half seconds to three. Nobody should stop doing this.

Partitioning speeds a query by letting the planner skip partitions. Skipping requires a predicate the planner can map onto the partition key, and this query wraps that key in a function, so no partition is skipped and every one that exists is read.

The query needs one partition. It reads ninety.

```
partitions before retention : 400
partitions dropped          : 310
partitions after            : 90
partitions the query needs  : 1
read over needed            : 90 times
```

```
scan before, ms             : 13600
scan after, ms              : 3060
scan if pruned, ms          : 34
retention saved, ms         : 10540
pruning would save, ms      : 3026
```

```
the retention job
  drop is a catalog operation : instant, not a delete
  storage reclaimed whole     : yes
  policy                      : 90 days, matching the licence
  partitions dropped          : 310
  query time, before and after: 13600 ms to 3060 ms
  verdict                     : WORKING
```

```
  the improvement is real and stopping this job would
  undo it
```

```
pruning
  requires  : a predicate the planner can map onto the
    partition key
  the query : wraps that key in a function
  partitions skipped : 0
  partitions read    : 90, all of them
```

```
  the partitioning is not broken and the planner is not
  wrong; a function of the key is not the key
```

```
share of the remaining time that is unneeded : 9888 per ten thousand
```

```
what the four-times improvement showed
  the query got faster       : yes, by 10540 ms
  because pruning started working : no
  because there is less to scan in full : yes
  next time the table grows  : the time comes back
  the investigation after the win : closed
```

```
null control - the predicate written against the key itself
  partitions dropped : 310, unchanged
  partitions read    : 1
  scan, ms           : 34
  retention did not do less; the query stopped reading
  everything retention had left
```

```
what dropping a partition guarantees
  that data is gone and its storage is back : exactly
  the query reads only what it needs         : not
    addressed; how many partitions are read is decided by
    the predicate, and retention changes how many exist
```

```
shrinking a full scan improves it proportionally and leaves
it a full scan; when a maintenance job and a missing
optimisation move the same number, the job gets the credit
```

Retention dropped 310 partitions instantly, reclaimed the storage whole, and took the query from 13600 ms to 3060 ms. The predicate wraps the partition key in a function, so nothing is pruned and all 90 remaining partitions are read for a query needing 1 - 90 times too many, 9888 per ten thousand of what is left - and the improvement closed the investigation.

Verify it yourself:

```bash
pnpm eml run examples/the-partition-was-dropped-and-the-query-scanned-it/the_partition_was_dropped_and_the_query_scanned_it.eml
```
