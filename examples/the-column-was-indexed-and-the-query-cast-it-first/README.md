# The column was indexed and the query cast it first

`the_column_was_indexed_and_the_query_cast_it_first.eml` - A lookup column is indexed, the index is healthy, and the query filters on exactly that column. The query reads the whole table. What the index can be used for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The index is right and it was added for this query. The column is highly selective, the index is small enough to stay resident, it has no bloat, its statistics are current, and the planner is doing exactly what a planner should. Nobody made a mistake choosing it.

An index orders the values of a column. A predicate that applies a function to the column asks about the values of that function, and no ordering of the inputs is an ordering of the outputs.

The column here is a bigint and the parameter arrives as text. The comparison needs one type, so one side is converted, and the side that gets converted is the one the planner cannot leave alone.

```
table rows            : 48000000
queries per hour      : 900
rows matching a query : 1
```

```
the index
  exists              : yes
  on the filtered column : yes
  bloat               : none
  statistics          : current
  selectivity         : 1 row in 48000000
  health checks failing : 0
```

```
the plan chosen
  access method      : sequential scan
  index used         : no
  rows read per query : 48000000
  rows returned      : 1
  rows read per hour : 43200000000
```

```
  rows read per row returned : 48000000
```

```
what the comparison actually asks
  written    : the column equals the parameter
  column type: bigint
  parameter  : text
  resolved   : text(column) equals the parameter
```

```
  the index orders the column
  the predicate orders text(column)
  and text of a bigint does not sort like the bigint:
  100 sorts before 99, and 1000 before 2
```

```
  so the planner is not declining to use the index,
  it is answering that no index on this table can serve
  that predicate, which is true
```

```
the index is not used by this query and is still maintained
  writes per day        : 1200000
  index updates per day : 1200000
  pages kept resident   : yes
  benefit to this query : none
```

```
  the cost side of the index is unconditional
  the benefit side is conditional on a predicate shape
```

```
where this would show up
  index health check    : green, the index is fine
  missing index advisor : silent, the index exists
  slow query log        : the query, with no reason attached
  unused index report   : this index, flagged as unused
```

```
  the last two are the same fact seen from two ends,
  and they are on different dashboards owned by different people
```

```
hour   queries   rows read       returned
  1      900       43200000000   900
  2      900       86400000000   1800
  3      900       129600000000   2700
  4      900       172800000000   3600
```

```
control - the same index with a matching parameter type
  access method       : index scan
  rows read per query : 1
  rows returned       : 1
  rows read per hour  : 900
  defects in the index : 0
```

```
  the index was correct the whole time and is doing here
  exactly what it was added to do
```

```
null control - the identical predicate on a 400 row table
  index used     : no, same reason
  rows read      : 400
  rows returned  : 1
  plan the planner would choose anyway : sequential scan
  cost of the cast : none
  the defect is unchanged; what changed is what it was hiding
```

```
what an index being present is evidence of
  the column has an ordered structure : yes
  a predicate on that column can use it : only if the predicate
    compares the column itself
  and a type mismatch inserts a function without appearing in
  the query text at all
```

```
the thing to read is not the index list, it is the plan:
rows read against rows returned, which here is 48000000 to 1
```

The index is healthy, current, selective to 1 row in 48000000, and was added for this query. Because the parameter arrives as text the comparison becomes one about text of the column, which no index on this table orders, so each of the 900 queries an hour reads 48000000 rows to return 1 - 48000000 to 1 - while the index is still updated on all 1200000 writes a day.

Verify it yourself:

```bash
pnpm eml run examples/the-column-was-indexed-and-the-query-cast-it-first/the_column_was_indexed_and_the_query_cast_it_first.eml
```
