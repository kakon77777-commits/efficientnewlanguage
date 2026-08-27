# The number was right and the label came from another query

`the_number_was_right_and_the_label_came_from_another_query.eml` - A report shows four regions and their totals. The names come from one query and the totals from another, joined by row position. What each region is shown as is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Splitting the two queries was reasonable and it was done for a reason. The names live in a reference table that changes once a quarter and is cached; the totals come from a warehouse scan that takes eleven seconds. Running them separately lets the page render the labels immediately and fill the numbers when they arrive, which is a real improvement a user can feel.

Both queries are correct. Each returns exactly the rows it should, with exactly the right values, and each has an ORDER BY - which is more than most queries have. They order by different columns, because each was written to be read on its own: the names alphabetically, the totals largest first.

Joining by position is joining on a column neither query returns.

```
query A returns names ordered by name  : east, north, south, west
query B returns totals ordered by value: 960, 412, 388, 175
the report pairs them by row position
```

```
region   shown   true    correct
  east     960     412     NO
  north     412     960     NO
  south     388     175     NO
  west     175     388     NO
```

```
  rows with the wrong label : 4 of 4
```

```
quantities that survive a permutation
  sum of the totals, as shown : 1935
  sum of the totals, true     : 1935
  difference                  : 0
  row count, as shown         : 4
  largest value on the page   : 960
  largest value in truth      : 960
```

```
  the monthly reconciliation compares the total and the row count
  both match exactly, and they would match under any permutation
```

```
questions the report is now wrong about
  what is the total across regions   right
  how many regions are there         right
  what is the largest regional total right
  WHICH region is largest            wrong
  is north above target              wrong
  every question naming a region is wrong and every aggregate is right
```

```
a fixture where the two orderings agree
  alpha : shown 900, true 900, correct
  bravo : shown 600, true 600, correct
  charlie : shown 300, true 300, correct
  delta : shown 100, true 100, correct
  mislabelled rows : 0 of 4
  names ascending and values descending happen to agree here
  a fixture written alphabetically with decreasing values passes
```

```
control - each query judged alone
  query A: returns 4 region names, ordered by name   : correct
  query B: returns 4 totals, ordered by value desc   : correct
  incorrect queries : 0 of 2
  and each has an explicit ORDER BY, which is more than most queries have
```

```
  the defect is in the join, and the join is a line of presentation code
  that reads neither query's ORDER BY
```

```
null control - the same position join with both sides ordered by value
  north : 960, correct
  east : 412, correct
  west : 388, correct
  south : 175, correct
  mislabelled rows : 0 of 4
  same join, same code, same two queries
  position is a valid key exactly when both sides share an ordering
```

```
joining two result sets by position
  each query correct on its own       necessary, not sufficient
  each query has an ORDER BY          necessary, not sufficient
  the two ORDER BY clauses agree      this is the condition
  and it is not stated in either query, or in the join
```

```
the aggregate checks cannot find it, because a permutation preserves them
the check that finds it is joining on a key, which removes the question
```

Splitting the queries lets the page render labels in milliseconds instead of eleven seconds, and both queries are correct with an explicit ORDER BY each. They order by different columns because each was written to be read alone. Pairing them by row position mislabels 4 of 4 rows while the total, 1935, and the row count both reconcile exactly - as they would under any permutation.

Verify it yourself:

```bash
pnpm eml run examples/the-number-was-right-and-the-label-came-from-another-query/the_number_was_right_and_the_label_came_from_another_query.eml
```
