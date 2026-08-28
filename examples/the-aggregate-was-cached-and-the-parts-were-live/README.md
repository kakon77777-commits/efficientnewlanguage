# The aggregate was cached and the parts were live

`the_aggregate_was_cached_and_the_parts_were_live.eml` - One page shows a total at the top and the rows it totals underneath. The total is cached for five minutes; the rows are queried live. What the two disagree by is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Caching only the total is the right optimisation and it was chosen by measurement. The total is a full scan of eleven seconds; the row list is an indexed range of forty milliseconds. Caching the cheap query would save nothing and cost staleness, so it was left live. Caching the expensive one takes the page from eleven seconds to forty milliseconds, which is the difference between a page people use and a page they do not.

Caching is applied per query, by cost. Consistency is a property of a PAIR of queries, and no per-query decision can hold it. The two are cached differently precisely because they cost differently, and cost is unrelated to whether they are read together.

Both numbers on the page are correct. They are correct as of two different moments, and the page presents them as one moment.

```
total query  : 11000 ms, cached for 300 seconds
row list     : 40 ms, live
change rate  : 40 per minute
```

```
  rows added while one cached total is served : 200
  the header is behind the list by 0 at the start of a cache window
  and by 200 at the end of it
```

```
seconds into window   header says   list contains   difference
  0                  1200         1200          0
  60                  1200         1240          40
  120                  1200         1280          80
  180                  1200         1320          120
  240                  1200         1360          160
  300                  1200         1400          200
```

```
  the header is a constant for the whole window, by design
  the list grows continuously, by design
  a user who counts the list disagrees with the header 66 percent of
  the way through, on average
```

```
how the disagreement is reported
  tickets naming the total as wrong : most of them
  tickets naming the list as wrong  : almost none
  reason : the list can be counted and the total cannot
  investigations that find a bug in the total query : 0
  the total query is correct, and it is answering a question about a
  moment that has passed
```

```
policy                         page load   maximum disagreement
  neither cached                 11040 ms     0
  total cached, list live        40 ms        200
  both cached, same key          40 ms        0
  both cached, separate keys     40 ms        200, and now both are stale
```

```
  the third row costs the same as the second and disagrees by nothing
  it needs the two queries to share one cache entry, which means treating
  them as one answer rather than two
```

```
control - is either query wrong
  total query, run directly : correct for the moment it ran
  list query, run directly  : correct for the moment it ran
  queries with a defect     : 0 of 2
  cache implementation bugs : 0, it expires exactly on schedule
```

```
  and a page is not a query; it is two of them, presented as one
```

```
null control - the same caching over a dataset that changes daily
  changes per day            : 1
  drift within a cache window: 0
  page load                  : 40 ms, same saving
  disagreement               : none, on almost every window
  same TTL, same policy, same code
  the cost is the change rate times the TTL, and the caching decision
  looked at neither
```

```
caching decisions are made per query
  cost of the query            visible at the call site
  staleness the user tolerates visible at the call site
  whether it is read beside another query   NOT visible at the call site
  and consistency is a property of that pair, not of either one
```

```
the two queries here were cached differently BECAUSE they cost differently,
and cost has nothing to do with whether they appear on the same screen
```

Caching the eleven-second total and leaving the forty-millisecond list live is the correct decision on every per-query axis: it is where the saving is, and caching the cheap one would buy nothing. Both queries are right. By the end of a 300-second window the header is 200 behind the rows it claims to total, and every support ticket about it names the number that cannot be counted.

Verify it yourself:

```bash
pnpm eml run examples/the-aggregate-was-cached-and-the-parts-were-live/the_aggregate_was_cached_and_the_parts_were_live.eml
```
