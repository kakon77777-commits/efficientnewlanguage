# The compaction reclaimed space and the reads got slower

`the_compaction_reclaimed_space_and_the_reads_got_slower.eml` - Compaction reclaimed thirty-eight percent of the store and the space metric is right. What reads cost afterwards is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The compaction did what it is for. Overwritten versions and tombstones are merged away, the file count drops, the space is genuinely returned to the filesystem and stays returned. The job is not wasteful, it is not a no-op, and deferring it is how the store fills up.

Reclaiming space means REWRITING the files. Every byte that survives is written to a new file at a new offset, and the page cache holding the old files is now holding files nobody will read again.

The working set was ninety-three percent cached. It is rewritten in twenty minutes and the cache has to be paid for a second time.

```
bytes before                : 4120000000000
bytes after                 : 2554000000000
bytes reclaimed             : 1566000000000
share reclaimed             : 3800 per ten thousand
```

```
page cache, bytes           : 210000000000
times it is overwritten     : 12
```

```
the compaction job's report
  bytes reclaimed   : 1566000000000
  tombstones merged : all
  files after       : fewer
  data lost         : 0
  verdict           : SUCCESS
```

```
  the space is really back and it stays back; skipping
  this job is how the volume fills
```

```
reads while the cache refills
  p99 before, ms        : 3
  p99 after, ms         : 41
  added per read, ms    : 38
  minutes to rewarm     : 26
  reads in that window  : 131040000
```

```
p99 is now 136 tenths of what it was
```

```
the two charts
  space used   : falls, stays down, alerts on a threshold
  read p99     : rises, recovers in 26 minutes, alerts on a
    five minute average that never clears the threshold
```

```
  the job is scheduled on the first and evaluated on it
```

```
null control - the same compaction, rate limited
  bytes reclaimed : 1566000000000, unchanged
  p99 after, ms   : 6
  the compaction did not reclaim less; it stopped
  displacing the cache faster than it refills
```

```
what reclaimed space guarantees
  these bytes are available again : exactly
  nothing else got worse          : not addressed; the
    mechanism that returns the bytes is a rewrite, and a
    rewrite is what invalidates every cache above it
```

```
a maintenance job is evaluated on the resource it frees and
paid for in the one it disturbs; the second is usually a rate
and the first is usually a level, which is why only one of
them has an alert
```

The compaction reclaimed 1566000000000 bytes - 3800 per ten thousand of the store - with 0 data lost, and the space stays back. Rewriting what survives displaces the page cache 12 times over, so read p99 goes from 3 ms to 41 ms across 131040000 reads while it refills, on a chart nobody alerts on because the job is scheduled against the one that falls.

Verify it yourself:

```bash
pnpm eml run examples/the-compaction-reclaimed-space-and-the-reads-got-slower/the_compaction_reclaimed_space_and_the_reads_got_slower.eml
```
