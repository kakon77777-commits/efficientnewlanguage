# The batch was atomic and the batches were not

`the_batch_was_atomic_and_the_batches_were_not.eml` - Each batch is a transaction and no batch has ever half-applied. What one interrupted run leaves behind is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The batching is done correctly. Five hundred rows per transaction, chosen after measuring that a single transaction over seventeen thousand rows held locks long enough to time out other work; each batch commits or rolls back whole; and a kill -9 during a batch leaves that batch entirely absent. Three years, no half-applied batch.

Atomicity is a property of the TRANSACTION. The operation a person asked for spans thirty-four of them, and nothing in the database knows those thirty-four belong together.

The run failed at batch nineteen. Eighteen batches are committed.

```
rows in the operation   : 17000
batch size              : 500
batches                 : 34
failed at batch         : 19
```

```
batches committed       : 18
rows written            : 9000
rows not written        : 8000
half-applied batches    : 0
```

```
the batch transaction
  rows per transaction : 500
  chosen after measuring : a single transaction over 17000
    rows held locks long enough to time out other work
  commits or rolls back whole : yes
  kill during a batch  : that batch is entirely absent
  half-applied batches in three years : 0
  verdict              : ATOMIC
```

```
  the batch size is not arbitrary and the alternative was
  measured to be worse
```

```
the operation
  batches it spans     : 34
  a transaction covering all 34 : none, deliberately
  a record that they belong together : none in the database
  what a reader sees mid-run : 9000 of 17000 rows,
    every one of them whole
```

```
  each row is correct, each batch is correct, and the set
  is a state the operation was never supposed to produce
```

```
share of the operation applied : 5294 per ten thousand
```

```
the retry
  starts from     : the beginning
  re-applies      : 18 batches
  is that safe    : only if the write is idempotent
  was idempotence a requirement : no, the operation was
    thought of as all-or-nothing
  interrupted runs per month : 3
```

```
null control - a run marker written first and cleared last
  half-applied batches : 0, unchanged
  partial states a reader cannot detect : 0
  batch a retry resumes from : 18
  the transactions did not get bigger; the operation got
  a beginning and an end that outlive one of them
```

```
what an atomic batch guarantees
  this transaction is all or nothing : exactly
  the operation is all or nothing    : not addressed, and
    the batching was adopted precisely because covering
    the whole operation was too expensive
```

```
splitting a transaction for a good reason splits the
guarantee with it; the atomicity that is lost has to be
rebuilt above the batches, and nothing warns that it was
there
```

Every batch is atomic and 0 have half-applied in three years: 500 rows a transaction, a size chosen because one transaction over 17000 rows timed out other work. The operation spans 34 of them, so failing at batch 19 leaves 9000 rows written and 8000 not - 5294 per ten thousand applied - with every row whole, and a retry re-applies 18 batches nobody promised were idempotent.

Verify it yourself:

```bash
pnpm eml run examples/the-batch-was-atomic-and-the-batches-were-not/the_batch_was_atomic_and_the_batches_were_not.eml
```
