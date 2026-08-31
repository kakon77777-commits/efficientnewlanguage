# The trigger ran inside the transaction and its effect did not

`the_trigger_ran_inside_the_transaction_and_its_effect_did_not.eml` - The trigger runs inside the transaction, so it is rolled back with everything else. What was rolled back is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the side effect in a trigger is the careful choice. It fires in the same transaction as the row it reacts to, it sees the same snapshot, and if the transaction aborts the trigger's own writes vanish with the row. There is no window where the table says one thing and the trigger's bookkeeping says another. That is exactly what a trigger is for.

Rollback is a property of the DATABASE's writes. It restores what the database controls, and the trigger's outbound call is not one of those things: the request left the process, the remote system answered, and the remote system has never heard of this transaction.

Nine percent of these transactions abort on a constraint the trigger runs before. Their rows are gone. Their calls are not.

```
transactions per day        : 184000
committed                   : 167440
aborted after the trigger   : 16560
```

```
the database after an abort
  the inserted row        : gone
  the trigger's audit row : gone
  the counter it bumped   : restored
  orphaned records        : 0
  verdict                 : consistent
```

```
  every line is true, and this is why the logic was put in
  a trigger rather than in the application
```

```
what left the process before the abort
  remote systems notified per transaction : 3
  notifications sent on aborted work      : 49680
  notifications retracted                 : 0
```

```
  the database rolled back its own writes; the request had
  already been answered by a system that does not share
  the transaction
```

```
aborted share : 900 per ten thousand of the day
```

```
downstream state after one aborted transaction
  search index    : holds a document for a missing row
  billing         : holds a line item for work not done
  email           : delivered; not recallable in any sense
```

```
  the row that would let anyone find these was rolled back,
  so the reconciliation job has no key to look them up by
```

```
null control - the trigger writes an outbox row instead
  notifications on aborted work : 0
  notifications on committed work : 502320
  the trigger did not become more transactional; the
  effect moved inside the thing that already was
```

```
what running inside the transaction guarantees
  the trigger's DATABASE writes abort with it : exactly
  the trigger's other effects abort with it   : not
    addressed; rollback is implemented by the database
    over storage it owns, and an outbound call is not
    storage it owns
```

```
a transaction can only undo what it can see; the useful
question is not where the code runs but whether the effect
is a write to something the transaction controls
```

The trigger is inside the transaction and the rollback is complete: the row is gone, the audit row is gone, the counter is restored, 0 orphans. On the 16560 transactions a day that abort - 900 per ten thousand - it had already made 49680 calls to 3 systems that never heard of the transaction, and the key that would let anyone reconcile them was the first thing rolled back.

Verify it yourself:

```bash
pnpm eml run examples/the-trigger-ran-inside-the-transaction-and-its-effect-did-not/the_trigger_ran_inside_the_transaction_and_its_effect_did_not.eml
```
