# The worker scaled with the queue and the database did not

`the_worker_scaled_with_the_queue_and_the_database_did_not.eml` - The autoscaler scales workers on queue depth, which is the right signal, and it responded within a minute. How many of them can work is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The scaling policy is well chosen. Queue depth is the quantity that actually expresses unserved demand, it leads latency rather than lagging it, the cooldown is tuned so the fleet does not oscillate, and this policy has absorbed three genuine traffic spikes without anyone being paged.

A worker is not a self-contained unit of capacity. Each one opens ten connections to a shared database, and that database has a connection limit which is not an input to the scaling policy and not an output of it.

At two hundred and forty workers the fleet wants two thousand four hundred connections against a limit of five hundred.

```
connections per worker      : 10
database connection limit   : 500
workers at rest             : 20
workers at peak             : 240
```

```
connections wanted at peak  : 2400
workers that can connect    : 50
workers that cannot         : 190
```

```
the scaling policy
  signal          : queue depth
  leads latency rather than lagging it : yes
  cooldown tuned so the fleet does not oscillate : yes
  spikes absorbed without a page : 3
  autoscaler faults : 0
  response time     : under a minute
  verdict           : SCALED
```

```
  queue depth is the correct signal and choosing it over
  cpu was the right call
```

```
one worker, in resources
  compute       : provisioned by the autoscaler
  memory        : provisioned by the autoscaler
  database connections : 10, from a fixed pool the
    autoscaler neither reads nor allocates
```

```
  scaling a fleet multiplies every per-worker cost, and
  one of them is drawn on a resource with a ceiling
```

```
share of the peak fleet unable to connect : 7916 per ten thousand
```

```
what happens next
  a worker that cannot connect : fails health, is replaced
  the replacement              : also cannot connect
  queue depth                  : does not fall
  the policy reads that as     : still not enough workers
  the policy's response        : more workers
```

```
  every step is the designed behaviour of a component that
  is working
```

```
null control - the fleet capped at the pool's capacity
  autoscaler faults    : 0, unchanged
  workers at peak      : 50
  connections wanted   : 500
  workers that cannot connect : 0
  the policy did not get smarter; its output range
  stopped exceeding a resource it cannot see
```

```
what a correct scaling signal guarantees
  the fleet grows when demand is unserved : exactly
  the work gets done                       : not addressed;
    a worker is capacity only if every resource it needs
    scales with it, and the shared ones do not
```

```
an autoscaler multiplies a unit; the question is never
whether the signal is right but whether the unit is
self-contained, and a fixed pool makes it not
```

The policy is right and the autoscaler is faultless: queue depth leads latency, the cooldown is tuned, three real spikes absorbed, 0 faults. At 240 workers the fleet wants 2400 connections against a limit of 500, so 50 can work and 190 cannot - 7916 per ten thousand of the peak fleet - and the queue they were scaled to drain stays deep, which the policy reads as needing more.

Verify it yourself:

```bash
pnpm eml run examples/the-worker-scaled-with-the-queue-and-the-database-did-not/the_worker_scaled_with_the_queue_and_the_database_did_not.eml
```
