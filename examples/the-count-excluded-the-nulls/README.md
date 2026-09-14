# The count excluded the nulls

`the_count_excluded_the_nulls.eml` - The average rating is 8.00 and the query that produced it is correct SQL. What the denominator counts is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The query is written carefully. It reads the real ratings column, not a cached rollup; it runs over every user row, not a sample; it uses the database's own AVG so the arithmetic is not hand-rolled; and the number is refreshed nightly.

AVG(score) and COUNT(score) skip the rows where score IS NULL, and 1200 users left it null.

```
users                           : 5000
  who rated                     : 3800
  whose score is null           : 1200
total rating points             : 30400
```

```
reported average                : 800 per hundred
participation                   : 7600 per ten thousand
users outside the denominator   : 1200
average if every user counted   : 608 per hundred
```

```
the average query
  reads : the real ratings column, not a rollup
  over : every user row, not a sample
  arithmetic : the database's own AVG
  refreshed : nightly
  rows it averaged : 3800
  verdict : AVERAGE 8.00
```

```
  using the engine's AVG rather than a hand-rolled sum is
  the part done right here, and it is why the 8.00 over
  those rows is exact
```

```
COUNT(score), the denominator
  what it counts : rows where score is not null
  what it skips : rows where score IS NULL
  users who left it null : 1200
  so the denominator : 3800, not 5000
  what AVG is over : the raters, not the users
```

```
the sentence 'our users rate us 8.00'
  the users it is actually about : the 3800 who rated
  the users it seems to be about : all 5000
  participation behind the number : 
    7600 per ten thousand
  is the average wrong : no; it is exact over its rows
  is its denominator the population the reader assumes :
    no
```

```
null control - COUNT(*) denominator, non-response stated
  average over raters : 800 per hundred, unchanged
  participation : 7600 per ten thousand
  non-responses now stated : 1200
  no rating changed; the null stopped being dropped from
  the count and started being reported as a non-response
```

```
what an AVG(score) of 8.00 guarantees
  the users who rated average 8.00 : exactly, the
    engine's own AVG over the non-null scores
  the average is over the users : not addressed; COUNT and
    AVG skip the NULLs, so the denominator is the 3800
    who rated, not the 5000 users - the 1200 who did not
    rate are silently outside it
```

```
a NULL is not a zero and not a row; the engine's aggregates drop it from the
denominator, so an average over a column is an average over the rows that filled
it, and the ones that did not are counted nowhere
```

It uses the engine's AVG over the real column, nightly, over every row - 8.00 exactly, over the 3800 who rated. COUNT(score) skips the 1200 NULLs, so the denominator is not the 5000 users the sentence implies - participation behind the 8.00 is 7600 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-count-excluded-the-nulls/the_count_excluded_the_nulls.eml
```
