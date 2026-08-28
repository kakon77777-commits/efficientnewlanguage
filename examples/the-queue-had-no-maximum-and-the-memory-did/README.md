# The queue had no maximum and the memory did

`the_queue_had_no_maximum_and_the_memory_did.eml` - The in-process queue has never rejected a message. How long that can continue is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: An unbounded queue was chosen on purpose and the argument for it is a real one. A bounded queue must decide what to do when it is full, and every answer is bad: dropping loses a message the producer believed was accepted, blocking turns a fast producer into a slow one and pushes the stall upstream, and returning an error means every caller needs a retry path for a condition that is not their fault. Removing the bound removes all three problems at once, and the rejection rate has been zero for the whole life of the service.

A queue in memory has a bound whether or not the code names one. Not naming it does not remove it; it moves it from a number the program can read to a number only the operating system can see, and it changes the failure from a rejected message to a terminated process.

```
produced   : 800 per second
consumed   : 600 per second
backlog    : 200 per second
item size  : 4 KB
memory     : 6 GB
```

```
  queue growth        : 800 KB per second
  seconds to exhaustion: 7864
  hours to exhaustion  : 2
```

```
minutes in   items queued   memory used MB   rejections
  20          240000        937             0
  40          480000        1875             0
  60          720000        2812             0
  80          960000        3750             0
  100          1200000        4687             0
  120          1440000        5625             0
```

```
  the rejection column is the one the dashboard shows
  it is zero at every point above, including the last one before the
  process is killed
```

```
the same load against a queue bounded at 100000
  seconds until full     : 500
  what happens then      : the producer is told, on the call that would
                           have been the first one to overflow
  memory used at that point : 390 MB of 6144
  process terminated     : no
  messages lost          : the ones refused, and the producer knows which
```

```
  unbounded: 7864 seconds of silence, then every in-flight message is lost
  bounded  : 500 seconds, then a refusal the producer can act on
```

```
messages at the moment of failure
  unbounded : 1572800 in the queue, all lost with the process
  bounded   : 0 in memory beyond the bound, refusals counted individually
  the unbounded queue converts a per-message refusal into one bulk loss
  and it does it at the moment the operator is least prepared
```

```
the three problems a bound creates, and where they went
  dropping loses a message the producer thinks was accepted
      unbounded: 1572800 messages, and the producer thinks all were accepted
  blocking pushes the stall upstream
      unbounded: the stall arrives anyway, as a restart
  an error needs a retry path in every caller
      unbounded: every caller needs a reconnect path instead
```

```
  each problem was moved, not removed, and each one got larger in transit
```

```
control - has the queue ever refused a message
  rejections, lifetime : 0
  is that number correct : yes
  can it be non-zero     : no, there is no branch that rejects
  a metric with one reachable value, on the dashboard for two years
```

```
  it reports the absence of a code path, and is read as the absence of
  a problem
```

```
null control - the same queue when the consumer is faster
  produced  : 800 per second
  consumed  : 900 per second
  backlog   : 0 per second
  memory    : flat
  rejections: 0, and now that zero means something
  same queue, same code, same absence of a bound
  the whole finding is the sign of one subtraction
```

```
a queue with no declared bound
  has no bound in the code      true
  has no bound                  false
  the bound is the machine's, and it is not readable from inside
  crossing it does not produce a rejection, it produces a termination
  and the rejection counter stays at zero through the whole approach
```

```
the measurement that would have found this is not the queue's own metric
it is produced minus consumed, which no queue reports because neither
number belongs to it
```

Removing the bound removed three real problems: a drop the producer cannot see, a stall pushed upstream, and a retry path in every caller. At 800 in and 600 out the queue grows 800 KB a second and reaches 6 GB in 2 hours, taking 1572800 messages with the process. The rejection counter reads zero for every one of those seconds, correctly, because nothing in the code can make it read anything else.

Verify it yourself:

```bash
pnpm eml run examples/the-queue-had-no-maximum-and-the-memory-did/the_queue_had_no_maximum_and_the_memory_did.eml
```
