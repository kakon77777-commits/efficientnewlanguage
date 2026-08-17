# The guard clause skipped the accounting

`the_guard_clause_skipped_the_accounting.eml` - A guard clause was added at the top of a loop. It skipped more than the record it was aimed at.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The guard is good practice: it takes the invalid case out of the way in one line and leaves the body un-nested, which is easier to read than wrapping everything below it in an `if`. Nothing about it is wrong.

What it changes is which lines of the body run. `continue` does not skip the record - it skips every line beneath it, and the accounting was beneath it, because the accounting is written last and appended at the bottom.

Both counts are computed by running the same records through both shapes.

```
records : 7
  valid   : 4
  invalid : 3
```

```
the loop with the guard at the top
  records the loop saw     : 7
  records the loop counted : 4
  total                    : 150
  the difference is 3, which is how many times continue ran
```

```
what the run actually handled
  records processed : 7
  of those declined : 3
  of those totalled : 4
  every record is accounted for, because the counting happens above the guard
```

```
the same filter written as if/else
  seen : 7, counted : 4, total : 150
  identical answers to the guard version, and seen is still 7
```

```
a running maximum over every record
  computed above the guard : 60
  computed below the guard : 60
  the two agree on this input, because the largest record happens to be valid
```

```
  the same two maxima where the largest record is invalid
  above the guard : 95, below the guard : 40
  here the placement of one line changes the answer by 55
```

```
control - a guard at the bottom of the body
  seen : 7, total : 150
  both answers intact, with the same continue in the same loop
```

The guard is correct and the body is easier to read for having it. What it skips is decided by what is written below it, and the accounting is written below everything because it was added last.

Verify it yourself:

```bash
pnpm eml run examples/the-guard-clause-skipped-the-accounting/the_guard_clause_skipped_the_accounting.eml
```
