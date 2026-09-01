# The index was rebuilt and the statistics were not

`the_index_was_rebuilt_and_the_statistics_were_not.eml` - The index is rebuilt, unbloated and correct. How many queries use it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rebuild did what it promises. The tree was forty percent dead space from six months of updates; it is now packed, its depth is one level shallower, and every entry in it points at a live row. Nothing about the index is stale and nothing about the rebuild was wasted.

Whether a query USES an index is not decided by the index. It is decided by the planner, from table statistics, and a rebuild does not collect statistics — it rewrites the structure the statistics describe without touching the description.

The last statistics were collected before a bulk load. They say the table has forty-one thousand rows. It has twelve million four hundred thousand, and at forty-one thousand a sequential scan is the correct plan.

```
rows in the table          : 12400000
rows in the statistics     : 41000
rows the planner cannot see: 12359000
the estimate is out by     : 302 times
```

```
the rebuild's report
  dead space before, percent : 40
  dead space after, percent  : 0
  tree depth                 : one level shallower
  entries pointing at dead rows : 0
  corruption found           : none
  verdict                    : REBUILT
```

```
  all true, and the bloat was real; deferring this is how
  an index stops fitting in memory
```

```
planning one query
  index condition matches    : yes
  index is usable            : yes
  estimated rows to return   : 41000, from the statistics
  at that estimate the cheaper plan is : a sequential scan
  index scans chosen this hour : 0
```

```
  the planner is not wrong; it is answering correctly from
  a number nobody refreshed
```

```
mean query time, ms
  before the rebuild            : 940
  after the rebuild             : 940
  after collecting statistics   : 3
```

```
  the rebuild moved it by, ms   : 0
  one statistics collection moved it by : 313 times
```

```
queries per hour            : 84000
seconds of query time / hour: 78960
```

```
the maintenance window
  planned    : rebuild the index
  verified   : the index is rebuilt
  measured   : dead space, tree depth, entry validity
  not measured : whether any query reaches it
```

```
null control - the same rebuild, then collect statistics
  rows in the statistics   : 12400000
  index scans chosen /hour : 84000
  mean query time, ms      : 3
  the index did not improve; the planner stopped being
  told the table was small
```

```
what a rebuilt index guarantees
  this structure is compact and correct : exactly
  queries will use it                   : not addressed;
    use is a planner decision taken from statistics, and
    the rebuild rewrote what the statistics describe
    without rewriting the statistics
```

```
maintenance that changes an object and a decision that reads
a description of it are two different clocks; the object can
be perfect and unreachable
```

The index is rebuilt and the report is right: 40 percent dead space gone, a level shallower, 0 entries pointing at dead rows. The statistics still say 41000 rows against 12400000 - an estimate out by 302 times, hiding 12359000 rows - so 0 of 84000 queries an hour reach it, the rebuild moved the mean by 0 ms, and one statistics collection moves it by 313 times.

Verify it yourself:

```bash
pnpm eml run examples/the-index-was-rebuilt-and-the-statistics-were-not/the_index_was_rebuilt_and_the_statistics_were_not.eml
```
