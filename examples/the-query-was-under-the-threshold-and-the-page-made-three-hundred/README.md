# The query was under the threshold and the page made three hundred

`the_query_was_under_the_threshold_and_the_page_made_three_hundred.eml` - The slow-query log has a fifty millisecond threshold and has not recorded an entry in a month. What one page render costs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The threshold is well chosen and the logging is real. Fifty milliseconds is not a placeholder; it was set from the distribution rather than picked round, every query the application issues goes through the instrumented client so there is no path that avoids the log, the log is read, and three genuine missing indexes were found and fixed with it last year.

The threshold is applied to a QUERY. A page render issues three hundred and one of them, each one honestly fast, and nothing measures the row that a reader actually waits for.

The budget for a page is two hundred milliseconds.

```
slow-query threshold, ms        : 50
queries over it last month      : 0
missing indexes found with it   : 3
```

```
mean query, ms                  : 4
  as a share of the threshold   : 800 per ten thousand
queries per page render         : 301
database time per page, ms      : 1204
```

```
page budget, ms                 : 200
  over it by                    : 1004
  budget as a share of the cost : 1661 per ten thousand
metrics on queries per render   : 0
pages of this shape             : 12
```

```
the slow-query log
  threshold : 50 ms, set from the distribution
  paths that avoid it : none; every query goes through
    the instrumented client
  is the log read : yes
  missing indexes it found : 3
  entries last month : 0
  verdict : FAST
```

```
  every query in this system is genuinely fast and the log
  is why three of them stopped being slow
```

```
the unit measured
  what carries a duration : one query
  what a reader waits for : one render
  queries in one render   : 301
  each of them under the threshold : yes, by 800
    per ten thousand of it
  their sum against the page budget : 1204 against 200
```

```
  no query is slow and the page is, and both statements
  are about the same milliseconds
```

```
lowering the threshold
  to catch a 4 ms query it must be below 4 ms
  queries it would then flag : all of them
  defects it would identify  : none; the query is fine
  what is actually wrong : the count, which is 301
  a threshold on a count : 0 exist
```

```
where 301 comes from
  the list query           : 1
  a related record per row : one call each
  is any of those calls wrong : no
  is the loop visible from the row : no; the row is a
    component and it asks for what it needs
  pages with this shape : 12
```

```
from the database side
  queries per second : high, and all of them cheap
  slow queries       : 0
  connection pool    : busy, which reads as healthy
  what a database dashboard shows : a well-tuned system
  what it is asked   : how long each query takes
  what it is not asked : how many arrived for one render
```

```
null control - a bound on queries per render
  slow-query threshold : 50 ms, unchanged
  metrics on queries per render : 1
  queries per render after the fix : 2
  no query got faster; the number of them became a
  quantity something is allowed to complain about
```

```
what an empty slow-query log guarantees
  no single query is slow : exactly, over every query the
    application issues, with no unlogged path
  the application is fast : not addressed; the threshold
    is applied per query and the wait is per request
```

```
a per-item bound bounds each item and says nothing about
how many items there are; the composition is where the cost
lives, and it is exactly the quantity a per-item instrument
cannot represent
```

The threshold is set from the distribution rather than picked, no query path avoids the log, and it found 3 missing indexes and has been empty for a month. It is applied to one query, each of which runs in 4 ms - 800 per ten thousand of the threshold - while a render issues 301 of them for 1204 ms against a 200 ms budget, 1661 per ten thousand of the cost, on 12 pages.

Verify it yourself:

```bash
pnpm eml run examples/the-query-was-under-the-threshold-and-the-page-made-three-hundred/the_query_was_under_the_threshold_and_the_page_made_three_hundred.eml
```
