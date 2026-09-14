# The migration touched no rows and passed every check

`the_migration_touched_no_rows_and_passed_every_check.eml` - The data migration passed every post-migration check, and each check is real. How many rows the migration touched is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The checks are careful. Each is a per-row assertion over the migrated rows, not a spot check; every migrated row is verified, not a sample; a single failing row fails the migration; and the checks run in the same transaction as the migration.

The migration's WHERE clause matched no rows, and a per-row check over no rows passes trivially.

```
rows in the table               : 2000000
rows the migration matched      : 0
rows the checks ran over        : 0
rows that failed a check        : 0
reported checks passed          : 100 per hundred
```

```
rows that needed migrating      : 740000
  left unmigrated               : 740000
unmigrated share                : 10000 per ten thousand
```

```
the post-migration checks
  each : a per-row assertion, not a spot check
  over : every migrated row, not a sample
  a failing row : fails the whole migration
  run : in the migration's own transaction
  rows that failed a check : 0
  verdict : ALL CHECKS PASSED
```

```
  per-row assertions in the same transaction is the part
  done right here, and it is why a genuinely bad migrated
  row would fail the run
```

```
the migrated rows
  the migration's WHERE matched : 0
  so rows the checks assert over : 0
  a per-row check over zero rows : passes, every one of
    none satisfied
  what 'all checks passed' means here : nothing was
    checked
  what it does not mean : that the migration ran
```

```
the migration's WHERE clause
  what it matched : 0
  why : it filters on a status value the rows no longer
    use after an earlier migration renamed it
  rows that actually needed the change : 
    740000
  did the checks notice they were untouched : no; they
    were never in scope
  is the pass false : no; it is vacuously true
```

```
null control - assert an expected row count
  checks pass over empty : 100 per hundred
  checks pass when empty is an error : 
    0
  rows a count assertion would flag as unmigrated : 
    740000
  no row changed; an empty change set stopped counting as
  a passed migration
```

```
what all-checks-passed guarantees
  every migrated row satisfies every check : exactly,
    per row, in one transaction, none failing
  the migration ran : not addressed; the WHERE matched no
    rows, and a per-row check over no rows passes trivially
    - 740000 rows that needed migrating were untouched, and
    every check was green over the empty set
```

```
a per-row guarantee is quantified over the rows in scope, and an empty scope
satisfies it completely; 'every migrated row is correct' is most true when no
row was migrated, which is when the migration did nothing
```

Each check is a per-row assertion over every migrated row in one transaction - all green. The WHERE matched 0 rows, so the checks passed vacuously over none, while 740000 rows that needed the change went untouched, 10000 per ten thousand of them.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-touched-no-rows-and-passed-every-check/the_migration_touched_no_rows_and_passed_every_check.eml
```
