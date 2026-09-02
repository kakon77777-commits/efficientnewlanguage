# The canary was healthy and it served the easy requests

`the_canary_was_healthy_and_it_served_the_easy_requests.eml` - The canary took one percent of traffic for an hour and beat the baseline on every metric. What it was asked to do is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The canary process is well built. One percent of traffic, an hour of soak, error rate and latency compared against the same window on the baseline pool, an automatic rollback if either regresses, and it has stopped two bad releases this quarter. The comparison is like-for-like on time, version and hardware.

Which requests reach it is decided by routing. Sessions are sticky, so an established session keeps the pool it was assigned; only NEW sessions can land on the canary, and a new session is a person who has just arrived.

An established session carries sixty-one items. A new one carries three.

```
canary share                  : 100 per ten thousand
soak, minutes                 : 60
baseline mean, ms             : 240
canary mean, ms               : 96
apparent improvement, ms      : 144
```

```
items in a new session        : 3
items in an established session : 61
work ratio                    : 20 times
```

```
the canary comparison
  traffic share       : 100 per ten thousand
  soak                : 60 minutes
  compared against    : the same window, same hardware
  automatic rollback on regression : yes
  bad releases stopped this quarter : 2
  verdict             : HEALTHY, BETTER THAN BASELINE
```

```
  it is a real gate and it has caught real regressions
```

```
which requests can reach it
  routing            : sticky by session
  established sessions : stay on their existing pool
  new sessions       : may land on the canary
  so the canary's population is : arrivals
```

```
  stickiness is there for a good reason and it is also
  the sampling rule
```

```
work per request on the canary, against production : 491 per ten thousand
```

```
the same canary, on the production mix
  measured mean, ms          : 96
  work ratio                 : 20
  implied mean at that mix, ms : 1952
  baseline mean, ms          : 240
```

```
  implied change, ms         : 1712
  which direction the gate reported : better
```

```
null control - established sessions also sampled
  soak, minutes         : 60, unchanged
  items per canary request : 61
  canary mean, ms       : 1952
  the canary did not get slower; it was asked the
  question the baseline is being asked
```

```
what a healthy canary guarantees
  this version is healthy on the traffic it received : exactly
  this version is healthy in production               : not
    addressed; the routing that selects the sample is
    chosen for other reasons and is not a sampling design
```

```
a canary is an experiment and its assignment rule is its
randomisation; when the rule correlates with the workload,
the result is about the sample and reads as being about the
population
```

The canary is healthy and the gate is real: 100 per ten thousand of traffic, a 60 minute soak, like-for-like comparison, automatic rollback, and 2 bad releases stopped this quarter. Sticky routing sends it only new sessions, which carry 3 items against 61 - 491 per ten thousand of the work - so its 96 ms implies 1952 ms at the production mix, against 240.

Verify it yourself:

```bash
pnpm eml run examples/the-canary-was-healthy-and-it-served-the-easy-requests/the_canary_was_healthy_and_it_served_the_easy_requests.eml
```
