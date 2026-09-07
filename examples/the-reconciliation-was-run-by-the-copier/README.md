# The reconciliation was run by the copier

`the_reconciliation_was_run_by_the_copier.eml` - A nightly reconciliation compares the operational database to the warehouse and has reported no discrepancy in two years. Which two things it compares is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reconciliation is not a formality. It runs every night without exception, it compares row counts and a per-column checksum rather than a count alone, it fails loudly rather than logging, it is paged on, and when the extract once died halfway it caught that within the hour.

It runs as the last step of the pipeline that does the copy. Its two operands are the batch that was read and the batch that was written, both held by the same process, so a row the extract never selected is in neither.

Forty-one thousand rows a night are excluded by the extract's filter.

```
nightly reconciliations         : 730
discrepancies reported          : 0
half-finished extracts it caught: 1
```

```
systems it names                : 2
  read independently            : 1
  taken on trust                : 1
  share read independently      : 5000 per ten thousand
```

```
processes that both copy and compare : 1
queries that read the warehouse back : 0
rows the extract filter excludes nightly : 41000
```

```
the nightly check
  runs : every night, no exceptions
  compares : row counts and a per-column checksum, not a
    count alone
  on mismatch : fails loudly and pages
  caught, once : an extract that died halfway
  discrepancies since : 0
  verdict : CONSISTENT
```

```
  a per-column checksum rather than a row count is the
  expensive choice and it is the one that caught the
  half-finished extract
```

```
the comparison
  named as : the operational database against the
    warehouse
  actually held : the batch that was read and the batch
    that was written, in one process
  where both came from : the same extract query
  what a row outside that query is : absent from both
  reads of the warehouse after the write : 0
```

```
  the check compares the pipeline to itself, which is why
  it caught a pipeline that stopped and cannot see one
  that never started on a row
```

```
the two kinds of failure
  the write failed after the read : both operands differ,
    the check is red, and this happened once
  the read never selected the row : both operands agree,
    because neither contains it
  the check's population : the extract's result set
  the question asked of it : whether the warehouse holds
    what the database holds
  rows outside the result set nightly : 41000
```

```
the excluded rows
  soft-deleted        : excluded on purpose
  test tenants        : excluded on purpose
  already archived    : excluded on purpose
  was each exclusion right when added : yes
  is the set of them reviewed : it is a WHERE clause
  does any report say the warehouse is a subset : no; the
    reconciliation says the two agree
```

```
the record
  nights run       : 730
  discrepancies    : 0
  what an analyst concludes : the warehouse is the
    database, and can be queried instead of it
  what is true : the warehouse is the extract, and the
    extract is the reconciliation's definition of the
    database
```

```
null control - the second side is read back independently
  per-column checksum : unchanged
  systems read independently : 2
  rows now inside the comparison : 41000 more
  the check did not get stricter; its second operand
  stopped being a variable the first operand wrote
```

```
what a green reconciliation guarantees
  the copy matched what was read : exactly, by checksum,
    every night, and it caught a truncated run
  the two systems agree          : not addressed; both
    sides came from one query, and a comparison cannot
    disagree about a row neither side was given
```

```
a consistency check is only as strong as the independence of
how its two sides were obtained; a check that runs inside
the pipeline it checks can detect the pipeline stopping and
never what the pipeline was told to ignore
```

The reconciliation runs every night, compares a per-column checksum rather than a row count, pages on failure, and caught an extract that died halfway - 0 discrepancies in 730 nights. It is the last step of the copy, so of the 2 systems it names it reads 1 independently - 5000 per ten thousand - and the 41000 rows a night its own filter excludes are in neither operand.

Verify it yourself:

```bash
pnpm eml run examples/the-reconciliation-was-run-by-the-copier/the_reconciliation_was_run_by_the_copier.eml
```
