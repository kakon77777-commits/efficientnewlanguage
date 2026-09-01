# The export finished and the import saw yesterday

`the_export_finished_and_the_import_saw_yesterday.eml` - The export finishes every night and the import reads it every night, and both have run without error for four hundred and nineteen days. How old the data is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both jobs are correct. The export writes to a temporary name and renames, so no reader ever sees a partial file; the import validates the row count against a manifest and refuses a file that disagrees; and the reconciliation job compares what the import produced against the file it read and has never found a discrepancy. Three real checks, all passing.

Every one of those checks compares the import to the FILE. None of them compares the file to the day. The two schedules were written by different teams eleven months apart and neither is expressed in terms of the other.

The import starts at 01:55. The export finishes at 02:00.

```
import starts at minute      : 115
export finishes at minute    : 120
the import is early by, minutes : 5
```

```
days running                 : 419
job failures                 : 0
reconciliation discrepancies : 0
hours of staleness           : 24
```

```
the three checks
  export writes to a temp name and renames : no partial
    file is ever visible
  import validates row count against a manifest : refuses
    a file that disagrees
  reconciliation compares output to the file it read :
    0 discrepancies in 419 days
  verdict : CONSISTENT
```

```
  none of the three is decorative; the manifest check
  caught a truncated transfer in month two
```

```
the quantity nobody holds
  the file the import read      : yesterday's
  the file the export wrote     : today's
  a check comparing the file's date to today : none
  the manifest's date field     : present, and compared
    against the file, not against the clock
```

```
  every check is internal to the pair, and the pair is
  consistently one day behind
```

```
the arithmetic of five minutes
  the import is early by, as a share of a day : 
    34 per ten thousand
  the data it reads is behind by, hours : 24
  rows delayed by a day, every day      : 3100000
  rows processed in total               : 1298900000
```

```
  a five-minute overlap produces a twenty-four hour lag,
  because the resource is published daily
```

```
what a downstream reader sees
  totals that add up      : yes
  joins that resolve      : yes
  yesterday's comparison  : also one day old, so the
    day-over-day delta is correct
  anything self-contradictory : nothing
```

```
null control - the import waits for today's file
  job failures            : 0, unchanged
  reconciliation discrepancies : 0
  hours of staleness      : 0
  neither job improved; the trigger stopped being a clock
  and started being the thing it was waiting for
```

```
what a passing reconciliation guarantees
  the output matches the input : exactly
  the input is the current one : not addressed; every
    check in the pipeline is internal to the pair, and
    which file is current is a fact about the clock
```

```
two jobs scheduled by time are coupled by an assumption
neither of them states; the check that would find it compares
a date to today, and nothing in a data pipeline naturally
does that
```

Both jobs have run for 419 days with 0 failures and 0 reconciliation discrepancies, on three checks that are each real - one of them caught a truncated transfer in month two. The import starts 5 minutes before the export finishes, 34 per ten thousand of a day, so it reads yesterday's file and everything downstream is 24 hours old and agrees with itself perfectly.

Verify it yourself:

```bash
pnpm eml run examples/the-export-finished-and-the-import-saw-yesterday/the_export_finished_and_the_import_saw_yesterday.eml
```
