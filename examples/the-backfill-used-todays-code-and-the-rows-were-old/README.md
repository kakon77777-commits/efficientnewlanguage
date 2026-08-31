# The backfill used todays code and the rows were old

`the_backfill_used_todays_code_and_the_rows_were_old.eml` - Three years of events are reprocessed through the current pipeline, which is correct. How many recomputed values disagree with what was actually done is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pipeline is right. It was reviewed, it is covered, and every value it produces today matches what the business rules say today. Running history through it is the obvious way to rebuild a derived table, and the rebuild itself has no bug in it.

Correctness is dated. The pipeline implements the rules IN FORCE NOW, and each historical event was decided under the rules in force then. Reprocessing does not recover the old decision; it replaces it with the decision today's rules would have made.

Four rules changed in the window. The recomputed table is internally consistent, disagrees with the ledger on twenty-three percent of rows, and the reconciliation report attributes every disagreement to the ledger.

```
events reprocessed              : 41300000
rule changes in the window      : 4
events predating the last change: 28900000
recomputed differs from recorded: 9640000
  wrong when it was recorded    : 12400
  differs because a rule changed: 9627600
```

```
the backfill's own checks
  events read           : 41300000
  events dropped        : 0
  pipeline exceptions   : 0
  output self-consistent: yes
  verdict               : SUCCESS
```

```
  all true; the pipeline applied one rule set uniformly and
  did not fail on a single row
```

```
applying one rule set to three years
  rule set applied     : the one in force today
  rule set that decided: whichever was in force that day
  events where those are the same : 12400000
  events where they are not       : 28900000
```

```
  the pipeline has no input for the second one; a rule set
  is not a column on the event
```

```
share disagreeing with the ledger : 2334 per ten thousand
```

```
the reconciliation report
  expected : the recomputed value
  actual   : the ledger
  rows flagged as ledger errors : 9640000
  rows that are ledger errors   : 12400
```

```
  the two are not distinguishable from inside the report,
  because both sides are values and the thing that separates
  them is a date the report does not carry
```

```
null control - the rule set chosen by the event's date
  pipeline exceptions   : 0, unchanged
  differs from recorded : 12400
  the pipeline did not get more correct; it stopped being
  asked a question about today
```

```
what a correct pipeline guarantees
  every output follows from the rules it implements : exactly
  every output matches the decision that was made   : not
    addressed, and reprocessing is precisely the operation
    that discards the second one
```

```
a backfill recomputes; it does not recover. If the rules ever
changed, the recomputed value answers a question nobody asked
on that date, and the ledger is the only record that they did
```

The pipeline is correct and the backfill is right to report success: 41300000 events read, 0 dropped, 0 exceptions, output self-consistent. It disagrees with the ledger on 9640000 rows - 2334 per ten thousand - of which 12400 were wrong when they were written and 9627600 differ because one of 4 rules changed afterwards, and the report files all of them under ledger error.

Verify it yourself:

```bash
pnpm eml run examples/the-backfill-used-todays-code-and-the-rows-were-old/the_backfill_used_todays_code_and_the_rows_were_old.eml
```
