# The migration ran forward and the code deployed first

`the_migration_ran_forward_and_the_code_deployed_first.eml` - Every migration is expand-contract, reviewed, run by CI against a copy of production, and none has needed downtime or a rollback. What runs during the deploy is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The migration discipline is the good kind. Nothing is renamed or dropped in the same change that adds it; every migration is additive first and the contraction is a separate change weeks later; each one is reviewed by someone other than its author; and CI runs it against a restored copy of production rather than an empty schema. Three hundred forty this year, no downtime, no rollbacks.

What CI tests is the NEW code against the NEW schema. A rolling deploy runs the old code against the new schema for as long as the roll takes, and that pair is not a pair anyone ran.

A roll takes fourteen minutes and there are sixty deploys a week.

```
migrations this year            : 340
  needing downtime              : 0
  rolled back                   : 0
  tested against a copy of production : 340
```

```
code and schema combinations that occur : 3
  the pipeline tests            : 2
  occur untested                : 1
```

```
deploys per week                : 60
minutes per roll                : 14
minutes a week in that combination : 840
  out of a week of              : 10080
  share                         : 833 per ten thousand
requests served by it, per week : 2436000
```

```
the migration practice
  additive first, contraction separate : always
  reviewed by someone other than the author : always
  run by CI against : a restored copy of production
  migrations this year : 340
  needing downtime     : 0
  rolled back          : 0
  verdict : EXPAND-CONTRACT
```

```
  testing against a restored copy rather than an empty
  schema is the expensive half and it is why this holds
```

```
the tested pair
  code   : the new build
  schema : after the migration
  what production ran before : old code, old schema
  what production runs after  : new code, new schema
  what production runs in between : old code, new schema
  where that pair is exercised : nowhere in CI
```

```
  the migration is compatible in the direction it was
  written for, and the deploy visits a state on the way
```

```
what additive means
  columns the old code reads : still there
  and that is the reason this usually works : yes
  a new constraint the old writer can violate : additive
  a new trigger firing on the old write path  : additive
  a new index changing the old plan           : additive
  additive describes the schema, not the
    behaviour of a writer that has not been told
```

```
the pipeline result
  migrations run against a production copy : 340
  failures : 0
  what each run proves : this migration applies, and the
    new code passes against the result
  what a reader takes it for : this migration is safe to
    deploy
  the difference between those : 1 combination, for
    840 minutes a week
```

```
null control - the old suite runs against the new schema
  migrations needing downtime : 0, unchanged
  combinations tested : 3
  combinations occurring untested : 0
  the migration did not get safer; the pipeline started
  running the pair the deploy actually produces
```

```
what a green migration pipeline guarantees
  the new code works against the new schema : exactly,
    against real data rather than an empty schema
  the deploy is safe                        : not
    addressed; a deploy is a sequence of states and the
    test covers its endpoint
```

```
a change tested as a before and an after is tested at two
points; a rolling deploy is the interval between them, and
the interval is where both versions are live at once
```

The migration practice is real: additive first with the contraction weeks later, independently reviewed, and run by CI against a restored copy of production - 340 this year with 0 needing downtime and 0 rolled back. CI pairs the new code with the new schema, so of the 3 combinations a rolling deploy produces it tests 2, and the remaining one runs for 840 minutes a week - 833 per ten thousand - serving 2436000 requests.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-ran-forward-and-the-code-deployed-first/the_migration_ran_forward_and_the_code_deployed_first.eml
```
