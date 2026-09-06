# The queue was ordered and the consumers were parallel

`the_queue_was_ordered_and_the_consumers_were_parallel.eml` - The log is ordered per partition and the producer partitions by entity, so every event for one entity arrives in order. What happens after arrival is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The partitioning was designed, not defaulted. A round-robin producer would spread one entity's events across forty-eight partitions and order would be meaningless; partitioning by entity id puts them all on one partition, where the log is a real ordered log. The broker's own out-of-order metric has read zero since the day it was turned on.

Ordering is a property of DELIVERY. The consumer takes a batch of five hundred off its partition and hands each message to one of eight worker threads, and eight threads finish in the order their work finishes.

Forty-one thousand entities a day have two events inside one batch.

```
partitions                      : 48
partitions one entity lands on  : 1
out-of-order deliveries measured: 0
```

```
consumer threads per partition  : 8
prefetch batch size             : 500
threads the second event can land on : 7
```

```
events per day                  : 12000000
entities with two in one batch  : 41000
  events in those pairs         : 82000
  share of events               : 68 per ten thousand
pairs applied in reverse order  : 8900
  share of those pairs          : 2170 per ten thousand
metrics on application order    : 0
```

```
the ordering design
  producer partitions by : entity id, deliberately
  the alternative rejected : round robin, which would
    spread one entity across 48 partitions
  partitions one entity lands on : 1
  the log within a partition : genuinely ordered
  out-of-order deliveries : 0
  verdict : ORDERED
```

```
  choosing the partition key for ordering rather than for
  balance is the decision that makes any of this possible
```

```
the boundary
  what the broker promises : the order you receive them in
  where that promise ends  : the moment the consumer has
    them
  what the consumer does next : hands 500 messages to
    8 threads
  what decides the order they finish in : how long each
    one takes
  is that a violation of the broker guarantee : no; the
    guarantee was kept in full
```

```
  delivery order and application order are two orders, and
  the design bought the first one exactly
```

```
the thread pool
  why it exists : one thread per partition could not keep
    up and the backlog was measured
  what it bought : throughput
  what it cost   : the order the partitioning bought
  were the two decisions made together : no; the
    partitioning predates the pool by a year
```

```
one reversed pair
  delivered in order : yes
  in the same batch  : yes
  threads they land on : two different ones
  what decides which finishes first : the handler, not
    the log
  what the entity ends up holding : the earlier state
  what an error log shows : nothing; both handlers
    succeeded
```

```
the two metrics
  out-of-order deliveries : measured, 0, and correct
  out-of-order applications : 0 metrics exist
  what the first one watches : the broker
  where the reordering happens : after the broker
  how the 8900 were counted : a one-off audit against
    each entity's own version column, run once
```

```
null control - the thread is chosen by entity, not by turn
  out-of-order deliveries : 0, unchanged
  consumer threads : 8, unchanged, so throughput is kept
  pairs applied in reverse : 0
  the ordering guarantee did not get stronger; the same
  key that chose the partition started choosing the thread
```

```
what a per-partition ordering guarantee gives
  events for one entity are delivered in order : exactly,
    and the partition key was chosen to make it true
  events for one entity take effect in order   : not
    addressed; the guarantee ends where the consumer
    begins, and the consumer is a pool
```

```
an ordering guarantee names a place where the order holds;
it is inherited by whatever reads there in one thread, and
any fan-out after that point re-decides the order using
something that is not the log
```

The partition key was chosen for ordering rather than balance, so one entity's events all land on 1 of 48 partitions and the broker has measured 0 out-of-order deliveries. The consumer hands each batch of 500 to 8 threads, so of 41000 entities a day with two events in one batch - 68 per ten thousand of events - 8900, or 2170 per ten thousand of them, take effect backwards, watched by 0 metrics.

Verify it yourself:

```bash
pnpm eml run examples/the-queue-was-ordered-and-the-consumers-were-parallel/the_queue_was_ordered_and_the_consumers_were_parallel.eml
```
