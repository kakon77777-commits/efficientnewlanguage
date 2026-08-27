# The limit was on the response and the cost was in the query

`the_limit_was_on_the_response_and_the_cost_was_in_the_query.eml` - The API returns at most 20 rows per call and the rate limiter counts calls. What one call costs the database is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both limits are sensible and each was set against a real constraint. Twenty rows keeps the response small enough to render and small enough to send over a slow connection, which is why the page size exists. Counting calls is the only unit the gateway can see: it sits in front of the service, it does not parse the query, and metering what it can observe is the correct thing for a gateway to do.

LIMIT bounds the rows that come back. OFFSET does not bound anything - the database must produce and discard every row before the window in order to know where the window starts. So the response size is constant and the work is proportional to how far in the caller has walked.

One number is what the caller pays. The other is what the database does.

```
rows in the table : 400000
page size         : 20
pages to walk it  : 20000
```

```
page    offset    rows produced   rows returned   produced per returned
  1      0      20        20              1
  100      1980      2000        20              100
  1000      19980      20000        20              1000
  5000      99980      100000        20              5000
  20000      399980      400000        20              20000
```

```
  the response column never changes
  the rate limiter meters the response column
```

```
reading every row, 20 at a time, by offset
  rows returned  : 400000
  rows produced  : 4000200000
  ratio          : 10000 to 1
  api calls made : 20000
  quota consumed : 20000, the same as any other 20000 calls
```

```
caller A: page 1, 20000 times
  rows produced : 400000
  api calls     : 20000
caller B: pages 1 to 20000, once each
  rows produced : 4000200000
  api calls     : 20000
```

```
  ratio of database work : 10000 to 1
  ratio of quota consumed : 1 to 1
  ratio of bytes returned : 1 to 1
```

```
what the gateway observes
  number of calls          yes, it counts them
  size of each response    yes, it forwards the bytes
  offset in the query      no, it does not parse the query
  rows the database read   no, that is on the other side of the service
  metering what it can see is right; it just does not correlate with cost
```

```
keyset pagination: pass the last key instead of an offset
page    rows produced   rows returned
  1      20              20
  100      20              20
  1000      20              20
  5000      20              20
  20000      20              20
```

```
  full walk, rows produced : 400000
  against 4000200000 by offset
  saving                   : 10000 times
  the response is byte-identical and the page size is unchanged
```

```
control - is either limit wrong for its own purpose
  page size 20: response small enough to render and to send : yes
  rate limit per call: meters what the gateway can observe   : yes
  incorrect limits : 0 of 2
  the response really is bounded, on every call, at every depth
```

```
  the unbounded quantity is on neither side of either limit
```

```
null control - the same API used only for page 1
  pages requested : 1
  rows produced   : 20
  rows returned   : 20
  produced per returned : 1
  same limits, same gateway, and cost tracks quota exactly
  the divergence is the offset, and a user interface never sends a large one
```

```
a limit bounds what it names
  LIMIT bounds rows returned         yes
  LIMIT bounds rows examined         no
  OFFSET bounds nothing              it is work, spelled like a coordinate
  a meter on the response is a meter on the bounded quantity
  the unbounded one has no meter, because nothing in the path can see it
```

Twenty rows keeps a response renderable and metering calls is the only unit a gateway can observe without parsing the query - both correct. OFFSET is not a coordinate the database can jump to; it is rows it must produce and throw away. Walking 400000 rows 20 at a time produces 4000200000 rows, which is 10000 times the table, for exactly the same 20000 calls of quota as reading the first page 20000 times.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-on-the-response-and-the-cost-was-in-the-query/the_limit_was_on_the_response_and_the_cost_was_in_the_query.eml
```
