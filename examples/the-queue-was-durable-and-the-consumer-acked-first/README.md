# The queue was durable and the consumer acked first

`the_queue_was_durable_and_the_consumer_acked_first.eml` - The broker has never lost a message and its durability report is correct. How much work is lost is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The durability is real and expensive. Every publish is fsynced before the acknowledgement goes back, every message is replicated to two other brokers before it is considered committed, and a deliberate power-cut drill last quarter lost nothing. The broker's zero is a measured zero, not a default.

What the broker guarantees is about the MESSAGE. It says the bytes survive until a consumer says it is done with them, and the consumer says that as the first thing it does rather than the last.

The consumer acks on receipt, then processes. Between those two the message is no longer the broker's problem and not yet anybody's result.

```
messages per day            : 8400000
consumer crashes per day    : 47
prefetch                    : 250
acked but unprocessed, mean : 118
work lost per day           : 5546
```

```
the broker's durability
  publish fsynced before ack : yes
  replicas before commit     : 2
  power-cut drill last quarter : lost nothing
  messages lost by the broker  : 0
  verdict                    : DURABLE
```

```
  the zero is measured, and the drill that measured it is
  the reason anyone trusts this queue
```

```
one message, in order
  1. broker delivers   : durable up to here
  2. consumer acks     : the broker forgets it
  3. consumer processes: nothing is holding it
  4. result written    : the first durable record since step 1
```

```
  the guarantee ends at step 2 and the work starts at
  step 3; the gap is where the crashes land
```

```
share of the day's work lost : 6 per ten thousand
```

```
the two counters
  delivered by the broker   : 8400000
  results written           : 8394454
  either number alone       : correct and unremarkable
  a report comparing them   : does not exist
```

```
null control - ack after the result, not on receipt
  messages lost by the broker : 0, unchanged
  work lost per day           : 0
  redelivered instead         : 5546
  the broker did not get more durable; the ack moved to
  the far side of the work it was standing for
```

```
what a durable queue guarantees
  the message survives until it is acked : exactly
  the work the message asked for happens : not addressed;
    the queue cannot observe the work, only the ack, and
    the consumer decides what the ack means
```

```
durability is a property of a message and delivery is a
property of a pair; an ack sent before the work is a promise
the consumer makes on the queue's behalf without being asked
```

The broker is durable and its zero is measured: fsync before ack, two replicas before commit, a power-cut drill that lost nothing, 0 messages lost. The consumer acks on receipt, so 47 crashes a day take 118 already-forgotten messages each - 5546 pieces of work, 6 per ten thousand - and both sides' counters are correct because the only number that would show it is a difference.

Verify it yourself:

```bash
pnpm eml run examples/the-queue-was-durable-and-the-consumer-acked-first/the_queue_was_durable_and_the_consumer_acked_first.eml
```
