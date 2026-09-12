# The migration steps were each reversible and the sequence was not

`the_migration_steps_were_each_reversible_and_the_sequence_was_not.eml` - Every step of the migration ships with a down-migration, and each reverse is correct on its own. What happens when the sequence is rolled back is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The migration is disciplined per step. Each of the five steps has a reverse; each reverse was tested by applying the step and undoing it in isolation; the reverses run in the opposite order; and no step is marked irreversible.

Step three drops a column that step five's reverse needs to restore data.

```
steps                           : 5
  each with a tested reverse    : 5
  marked irreversible           : 0
the step that drops the column  : 3
the step whose reverse needs it : 5
  steps between them            : 2
```

```
rows whose data lived there     : 74000
reverses for the whole sequence : 0
```

```
the per-step reversibility
  each step : ships with a down-migration
  each reverse : tested by apply-then-undo in isolation
  reverses run : in the opposite order
  steps marked irreversible : 0
  steps with a working reverse : 5
  verdict : EVERY STEP REVERSIBLE
```

```
  testing each reverse in isolation is the part done
  right here, and it is why no single step is a trap
```

```
the reverse tested alone
  what step three's reverse restores : the column, empty
  what filled that column before : data step three
    dropped
  what step five's reverse then needs : that data, to
    rebuild its own table
  in isolation : step five's reverse was tested with the
    column still present, so it passed
  in sequence : the column is gone by the time it runs
```

```
rolling the whole sequence back
  steps five then four then three : run in reverse
  what step three's reverse cannot bring back : the
    dropped data, only the empty column
  rows step five's reverse cannot rebuild : 
    74000
  did any single reverse fail its own test : no
  what failed : the composition, which no step tested
```

```
null control - step three archives before it drops
  rows lost with the archive : 0
  rows lost without it : 74000
  reverses that gain a dependency : 
    1
  no step and no order changed; the dropped data stopped
  being unrecoverable when a later reverse asks for it
```

```
what per-step reversibility guarantees
  each step can be undone in isolation : exactly, five of
    five, tested apply-then-undo, none irreversible
  the migration can be rolled back : not addressed; each
    step has a reverse, and reversibility does not compose
    - step three drops a column step five needs, so rolling
    back the whole sequence cannot restore 74000 rows
```

```
reversibility is a property of a step against the state it was tested in, and a
sequence puts each step in a state its test never saw; an earlier step can
destroy what a later step's reverse depends on
```

Every step ships a reverse, each tested apply-then-undo in isolation - none irreversible. Step three drops a column step five's reverse needs, and reversibility does not compose, so a full rollback restores an empty column and loses 74000 rows, under 0 reverse for the sequence as a whole.

Verify it yourself:

```bash
pnpm eml run examples/the-migration-steps-were-each-reversible-and-the-sequence-was-not/the_migration_steps_were_each_reversible_and_the_sequence_was_not.eml
```
