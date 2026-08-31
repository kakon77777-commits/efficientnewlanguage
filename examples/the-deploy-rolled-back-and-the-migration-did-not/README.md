# The deploy rolled back and the migration did not

`the_deploy_rolled_back_and_the_migration_did_not.eml` - The rollback completed in ninety seconds and every instance is running the previous release. What the table holds afterwards is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rollback is correct and fast. Instances are immutable, the previous image is still in the registry, traffic shifted cleanly, and the release that caused the errors is gone from every node. This is the thing rollbacks are for and it worked.

A rollback reverts the CODE. It does not revert the migration, and it should not: dropping the column would destroy the values the new release wrote, and no automated rollback is allowed to do that. So the schema stays forward and the code goes back.

The old release does not know the column. For forty-seven minutes it was written; for the six days since, it has not been, and nothing distinguishes the two kinds of empty.

```
minutes the new release was live : 47
rollback took, seconds           : 90
instances still on it            : 0
```

```
rows written while it was live   : 812000
rows written since the rollback  : 6340000
rows in the affected range       : 7152000
```

```
the rollback's checks
  instances on the previous image : all
  health checks passing           : all
  error rate                      : back to baseline
  time to complete, seconds       : 90
  verdict                         : ROLLED BACK
```

```
  every line is true and the incident was closed on them
```

```
the schema after the rollback
  column added by the migration : still there
  values written into it        : still there, 812000
  the old code's view of it     : it has none
  reverting the migration       : would destroy those values
```

```
  keeping it is the correct decision, and it is what makes
  the range below ambiguous
```

```
share of the range carrying a value : 1135 per ten thousand
```

```
when the release ships again
  rows where null means 'not set'    : from the 47 minutes
  rows where null means 'never asked': 6340000
  a column recording which           : does not exist
  the code's reading of null         : one meaning, applied
    to both
```

```
null control - the default set in the schema, not the code
  rollback time, seconds       : 90, unchanged
  rows with an ambiguous null  : 0
  rows carrying a stated value : 7152000
  the rollback did not improve; the writer that survives
  a rollback became the one that fills the column
```

```
what a rollback guarantees
  the code running is the previous code : exactly
  the system is in its previous state   : not addressed;
    anything the new code wrote is still written, and the
    schema it needed is still applied
```

```
deploys are reversible and migrations are not, so a release
that pairs them can only be half undone; the half that stays
is the half holding data
```

The rollback is complete and the incident report is right to close on it: every instance on the previous image in 90 seconds, 0 left behind, error rate at baseline. The column stays, correctly, holding values on 812000 rows from 47 minutes - 1135 per ten thousand of the affected range - and null on the 6340000 written since, where null means the writer never had the field.

Verify it yourself:

```bash
pnpm eml run examples/the-deploy-rolled-back-and-the-migration-did-not/the_deploy_rolled_back_and_the_migration_did_not.eml
```
