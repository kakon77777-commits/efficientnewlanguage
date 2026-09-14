# The top rows were the nulls

`the_top_rows_were_the_nulls.eml` - The leaderboard shows the top ten by score, ordered descending, and the ORDER BY is correct. Where a NULL score sorts is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The query is careful. It orders by the real score column; it uses the database's own sort, not a hand-rolled comparator; the descending direction is right for a leaderboard; and LIMIT 10 takes the first ten of that order.

NULL sorts before every value under DESC in this database, and 400 items have no score.

```
items                           : 8000
  with a score                  : 7600
  with a null score             : 400
highest real score              : 990
leaderboard size                : 10
```

```
top slots taken by null scores  : 10
  showing a real top score      : 0
rows before the highest real one: 400
```

```
the leaderboard query
  orders by : the real score column
  sort : the database's own, not a hand-rolled comparator
  direction : descending, right for a leaderboard
  limit : the first ten of that order
  hand-rolled comparators that could differ : 0
  verdict : TOP TEN BY SCORE
```

```
  using the engine's sort rather than a hand comparator is
  the part done right here, and it is why the ordering
  among real scores is exact
```

```
NULL under ORDER BY score DESC
  what NULL compares as : not greater, not less, unknown
  where this database puts it under DESC : first
  items with no score : 400
  so the first rows of the order : the unscored ones
  the highest real score : below all 400 of them
```

```
the top ten as rendered
  slots filled by null-score items : 10
  slots filled by the actual highest : 
    0
  the 990-point leader appears : below the nulls
  is the ORDER BY wrong : no; DESC is correct
  is the sort position of NULL the one the leaderboard
    assumes : no
```

```
null control - NULLS LAST (or exclude null scores)
  top slots that are null, NULLS FIRST : 
    10
  top slots that are null, NULLS LAST : 
    0
  real top scores it restores : 10
  no score changed; the sort stopped placing 'unknown' at
  the top of 'highest'
```

```
what ORDER BY score DESC LIMIT 10 guarantees
  the ten rows are the first ten of the sort : exactly,
    the engine's own descending order
  the top ten are the highest scored : not addressed;
    NULL sorts before any value under DESC here, and 
    400 items have no score - the top 10 are unscored
    NULLs, and the highest real score is below all of them
```

```
an ordering places NULL somewhere, and 'somewhere' under a descending sort is
often the top; 'highest' and 'unknown' are different, and a LIMIT taken off the
front hands back whichever the sort put there
```

It orders by the real column with the engine's sort, descending, limit ten - correct. NULL sorts first under DESC here and 400 items are unscored, so all 10 top slots are NULLs and the 990-point leader sits below them.

Verify it yourself:

```bash
pnpm eml run examples/the-top-rows-were-the-nulls/the_top_rows_were_the_nulls.eml
```
