# The batch committed and the notification did not

`the_batch_committed_and_the_notification_did_not.eml` - A batch writes rows inside a transaction and then tells the downstream service. The transaction is atomic. What "and then" costs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The transaction is correct and it is doing real work. Either every row of a batch lands or none does; a crash mid-write leaves no half-applied batch to reconcile by hand, and the constraint that would have been violated in the middle is never observable. That guarantee has held on every batch.

The notification is a network call to another service. It cannot join the transaction, so it happens after the commit returns — which is the only place it CAN happen, because before the commit there is nothing true to announce.

So there is a moment when the rows exist and nobody has been told, and the transaction's guarantee does not reach into it because it has already ended.

```
batches per day        : 4200
rows per batch         : 250
rows per day           : 1050000
commit to notify, gap  : 180 ms
```

```
the transaction, against what it promises
  batches partially applied  : 0
  constraint violations seen : 0
  rows written twice         : 0
  manual reconciliations     : 0
  defects in the transaction : 0
```

```
  atomicity holds on all 4200 batches a day
```

```
the window between commit and notify
  batch duration        : 2400 ms
  gap                   : 180 ms
  share of the batch    : 750 per ten thousand
```

```
  a crash in that window leaves the rows and loses the message
  batches affected per day : 315
  rows nobody is told about: 78750 per day
```

```
at the end of one day
  rows in the database      : 1050000
  rows downstream knows of  : 971250
  divergence                : 78750
```

```
  the database is internally consistent
  the downstream service is internally consistent
  neither is wrong about anything it can check alone
```

```
day   rows written   downstream knows   cumulative gap
  1     1050000        971250            78750
  2     1050000        971250            157500
  3     1050000        971250            236250
  4     1050000        971250            315000
  5     1050000        971250            393750
```

```
  nothing in that table is an error state on either side
```

```
retrying the notification
  where the pending message lives : in the crashed process
  messages recoverable after a crash : 0
  a retry helps when the CALL fails : yes
  a retry helps when the CALLER dies : no
```

```
  the two failure modes look identical from the callee
```

```
control - is the transaction earning its place
  partially applied batches without it : 315 a day
  partially applied batches with it    : 0
  rows needing manual repair with it   : 0
  defects in the transaction           : 0
```

```
  the transaction removes the failure inside the batch
  and cannot reach the one immediately after it
```

```
null control - the message written inside the transaction
  batches per day            : 4200
  crash window               : 180 ms, unchanged
  rows nobody is told about  : 0
  the crash still happens at the same rate
  what changed is which side of the commit the message is on
```

```
what a transaction's atomicity covers
  every write inside it          : completely
  the first statement after it   : not at all
  and 'after the commit' is the only place a call to another
  system can go, so the gap is not an oversight - it is where
  the design put the one step that cannot join
```

```
the repair is not a wider transaction, which cannot span two
systems; it is to make the message a row, so that announcing
and writing are the same commit
```

The transaction is atomic on all 4200 batches a day: 0 partial applications, 0 constraint violations, 0 manual reconciliations. The notification sits 180 ms after it - 750 per ten thousand of the batch - so 315 batches a day commit 78750 rows that nobody downstream is told about, and neither system can detect it, because each one is entirely consistent with itself.

Verify it yourself:

```bash
pnpm eml run examples/the-batch-committed-and-the-notification-did-not/the_batch_committed_and_the_notification_did_not.eml
```
