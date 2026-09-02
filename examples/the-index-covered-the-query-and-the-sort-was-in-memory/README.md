# The index covered the query and the sort was in memory

`the_index_covered_the_query_and_the_sort_was_in_memory.eml` - The plan is an index-only scan with zero heap fetches, which is what the index was designed for. Where the time goes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The index is covering and the plan proves it. Every column the query reads is in the index, the planner chooses an index-only scan, the visibility map is current so no row needs a heap visit, and heap fetches are zero. This is the outcome the index was added to produce and it produces it.

Covering describes which columns are READ. Ordering is a separate node in the plan, fed by the scan, and the index's key order is not the order the query asks for.

Two hundred and forty thousand rows come out of the scan and are then sorted, and the sort does not fit in the memory it is allowed.

```
rows returned            : 240000
heap fetches             : 0
index scan, ms           : 150
sort, ms                 : 1690
query, ms                : 1840
```

```
sort working set, kb     : 68400
memory allowed, kb       : 4096
over the allowance by    : 16 times
```

```
the plan
  access method     : index-only scan
  columns read from the heap : none
  heap fetches      : 0
  visibility map    : current
  verdict           : COVERING
```

```
  this is the property the index was added for, it holds,
  and removing the index would make this far worse
```

```
the two nodes
  scan  : reads 240000 rows from the index, 150 ms
  sort  : orders them by a column that is not the index's
    leading key, 1690 ms
  the index's contribution to the second : none
```

```
  an index can supply an order or supply the columns; this
  one supplies the columns
```

```
share of the query spent sorting : 9184 per ten thousand
```

```
the sort
  method            : external merge
  temporary files written : yes
  reason            : 68400 kb into 4096 kb
  correct behaviour : yes, this is what a sort does when
    it does not fit
```

```
null control - the ordering column added to the index key
  heap fetches      : 0, unchanged
  sort, ms          : 0
  query, ms         : 150
  the index did not become more covering; it started
  supplying an order as well as the columns
```

```
what a covering index guarantees
  no row is read from the heap : exactly
  the query is fast            : not addressed; the plan
    has other nodes, and the one that dominates here is
    fed by the scan rather than served by it
```

```
'covering' is a claim about columns and a query plan is a
tree; reading the property off the leaf and the time off the
root is how a correct index sits under a slow query
```

The scan is index-only with 0 heap fetches and a current visibility map, which is exactly what the index was added for. The ordering column is not in its key, so 240000 rows go to an external merge sort needing 68400 kb in 4096 kb - 16 times over - and 1690 of the query's 1840 ms, 9184 per ten thousand, are spent in a node the index does not touch.

Verify it yourself:

```bash
pnpm eml run examples/the-index-covered-the-query-and-the-sort-was-in-memory/the_index_covered_the_query_and_the_sort_was_in_memory.eml
```
