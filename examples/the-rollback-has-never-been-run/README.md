# The rollback has never been run

`the_rollback_has_never_been_run.eml` - Every migration ships with a rollback. How much of the data a rollback would return is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Writing the down migration is right and the review requires it. It is written at the same time as the up migration, by the person who understands the change best, and it is the difference between a bad deploy costing minutes and costing a night.

It is also the only part of the change that is never run. The up migration is exercised on every environment; the down one is exercised when something has already gone wrong, against a database that has been taking writes since.

Both the step rot and the data written since are computed per migration.

```
migrations with a down step : 5 of 5
down steps ever run in production : 0
```

```
migration            days   steps resolving   rows written since
  add_status_column   420    3 of 3           0
  split_name_field   310    2 of 4           88000
  drop_legacy_index   260    1 of 2           0
  add_audit_table   150    4 of 5           240000
  widen_amount   40    3 of 3           51000
```

```
migrations whose down steps all still resolve : 2 of 5
migrations with at least one step that does not : 3
```

```
migrations with data written since they were applied : 3
rows that arrived after the schema changed : 379000
  a down migration returns the schema and not those rows, and the number
  grows every day the migration stays applied
```

```
per migration, rows arriving per day since it was applied
  split_name_field : 283 a day, 88000 so far
  add_audit_table : 1600 a day, 240000 so far
  widen_amount : 1275 a day, 51000 so far
```

```
a rollback run today, per migration
  add_status_column : runs cleanly
  split_name_field : fails at step 3
  drop_legacy_index : fails at step 2
  add_audit_table : fails at step 5
  widen_amount : runs, drops 51000 rows
  rollbacks that would run cleanly : 1 of 5
```

```
the youngest migration : widen_amount, 40 days old
  its down steps : 3 of 3 resolve
  rows written since : 51000
  a rollback is almost always of the newest change, so the rot is almost
  never met - and the rot is still there for the day it is
```

```
control - a down migration run by the test suite on every branch
  runs per week : many
  steps that can rot unnoticed : 0, because a broken step fails a build
  what it still cannot test : the rows written in production since, which
  exist in no test database
```

Every migration has a rollback and every one was written by the right person. It is the only step that runs when something is already wrong, and what it returns is the schema rather than the rows.

Verify it yourself:

```bash
pnpm eml run examples/the-rollback-has-never-been-run/the_rollback_has_never_been_run.eml
```
