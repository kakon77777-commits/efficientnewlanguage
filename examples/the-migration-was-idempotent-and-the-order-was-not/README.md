# The migration was idempotent and the order was not

`the_migration_was_idempotent_and_the_order_was_not.eml` - A schema migration is twelve steps and every step is idempotent. It was replayed onto three shards and two of them ended up different. What idempotence covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Making each step idempotent is correct and it is the property that makes a migration operable. A step that can be rerun turns a partial failure into a retry instead of a restore, lets an operator resume from the middle without working out where the middle was, and makes the whole thing safe under an at-least-once runner. Every step here was tested for it, repeatedly.

Idempotence is a property of one step against itself. A migration is a sequence, and a sequence has a second property that no individual step can carry: whether the steps commute.

Both facts are true at once. Each step run twice leaves the same state, and two steps run in the other order do not.

```
steps in the migration     : 12
reruns tested per step     : 50
idempotence checks run     : 600
idempotence checks passed  : 600
idempotence failures       : 0
```

```
what was measured
  step applied twice equals step applied once : 12 of 12
  pairs of steps checked for commuting        : 0 of 66
```

```
  pairs that do not commute : 4
  and none of the 600 checks can observe one, because
  every check runs a single step against itself
```

```
step 7  add column state, default null            rerun safe : yes
step 9  set state to active where state is null   rerun safe : yes
```

```
order    result
  7 then 9   every existing row gets state active
  9 then 7   the update finds no such column yet, is skipped by
             the runner as already-applied, and every existing
             row keeps state null
```

```
  both orders complete, both report success, neither retries
```

```
shard   path              order applied      final state
  1     straight through  recorded order     state active
  2     resumed           sorted by step id  state null
  3     resumed           sorted by step id  state null
```

```
  shards agreeing with shard 1 : 1
  shards differing             : 2
  migration steps that failed  : 0
  migration steps that retried : 0
```

```
rows per shard          : 4200000
rows in total           : 12600000
rows left with state null : 8400000
share of the table      : 66 percent
```

```
  the migration is marked complete on all 3 shards
```

```
rerunning the whole migration on shard 2
  steps re-executed : 12
  steps that changed anything : 0
  rows repaired : 0
```

```
  the property that makes a retry safe is the same property
  that makes this retry useless
```

```
control - is idempotence holding
  steps proven rerun-safe : 12 of 12
  checks run              : 600
  check failures          : 0
  restores required       : 0
  defects in any step     : 0
```

```
  without it the two resumes would have needed a restore each
```

```
null control - the same runner where every pair commutes
  order-sensitive pairs : 0
  shards resumed        : 2
  shards differing      : 0
  same sort, same resume, same idempotence
  the runner did not become correct; the steps stopped caring
```

```
what idempotence certifies
  this step, applied again, changes nothing : yes, measured
  this step, applied later, does the same   : not measured
  the set of steps commutes                 : not measured, not implied
  and a per-step property has no place to record a pair
```

```
the missing test is not a longer rerun; it is two steps in the
other order, and the number of those to check is 66
```

Every one of the 12 steps is idempotent and 600 rerun checks confirm it with 0 failures, which is why two shards could be resumed without a restore. The runner sorts the log by step id, 4 of the 66 step pairs do not commute, and 8400000 of 12600000 rows - 66 percent - now hold a value the migration was written to remove, on shards it reports as complete.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-was-idempotent-and-the-order-was-not/the_migration_was_idempotent_and_the_order_was_not.eml
```
