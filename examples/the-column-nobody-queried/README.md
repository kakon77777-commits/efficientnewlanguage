# The column nobody queried

`the_column_nobody_queried.eml` - The column has been in the table for three years and no report has ever selected it. What is in it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding the column was right. It was cheap, it captures something the domain really has, and a column that exists from the start is far easier than a backfill later. Nobody was wrong to add it.

A column nobody reads is also a column nobody checks. Whether the writer ever populated it, whether it means the same thing in rows written by different versions, and whether it is null for whole eras are all questions that only a reader asks - and there has not been one.

The rows are counted by era rather than in total.

```
rows in the table : 1670000
rows with the column populated : 1080000, which is 64%
reports that select it : 0
```

```
era            rows      populated   meaning
  v1 2023   410000    0     not written at all
  v2 2024 H1   260000    260000     seconds
  v2 2024 H2   300000    300000     seconds
  v3 2025   520000    520000     milliseconds
  v3 2026   180000    0     dropped from the writer
```

```
a report written today, averaging the column
  rows it would average over : 1080000
  rows silently excluded     : 590000, which is 35%
  and nothing in the query says so, because a null is not an error
```

```
distinct meanings among the populated rows : 2
  seconds, milliseconds, 
  the same column holds two units, and the change was invisible because
  no reader was comparing one era to another
```

```
  rows in seconds      : 560000
  rows in milliseconds : 520000
  an average over both is a number in neither unit
```

```
what a single report, written in each era, would have caught
  in v1  : the column is empty, caught on the first run
  in v2  : nothing to catch, it was populated and consistent
  in v3  : the unit change, on the first comparison to a v2 figure
  in 2026: the writer dropping it, when the latest rows came back null
  three of the four eras had something a reader would have found, and the
  reader is the part that was never added
```

```
the column, three years on
  rows usable without a unit decision : 560000 or 520000, not both
  rows usable with one               : 1080000
  rows that will never be recoverable : 590000
  the backfill the column was added to avoid is now required anyway, for
  the eras where nothing was written
```

```
control - a column a dashboard has selected since it was added
  eras in which it was unpopulated : 0, because the dashboard broke
  unit changes that shipped        : 0, for the same reason
  the dashboard is not a better check than a reviewer; it is a check that
  runs, which is the property the unread column is missing
```

Adding the column was cheap and correct and the domain really has this field. Nothing has ever read it, so what it contains has been decided by three years of writers and checked by nobody.

Verify it yourself:

```bash
pnpm eml run examples/the-column-nobody-queried/the_column_nobody_queried.eml
```
