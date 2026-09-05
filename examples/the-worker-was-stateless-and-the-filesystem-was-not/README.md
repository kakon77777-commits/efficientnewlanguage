# The worker was stateless and the filesystem was not

`the_worker_was_stateless_and_the_filesystem_was_not.eml` - The workers hold no session state, any request can go to any pod, and a chaos test kills one every five minutes without a failed request. What persists is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The statelessness is real and it was earned. There is no in-memory session, no sticky routing, no affinity in the load balancer; scaling out works linearly; and the chaos test is not a drill on paper - it kills a random pod every five minutes, all day, and the failed-request count has been zero for eleven months.

Statelessness was established about memory. The container has a writable filesystem, a template compiler caches to it, and that cache survives every request boundary the memory claim was proved across.

A pod lives about thirty-four days before disk pressure evicts it.

```
worker pods                     : 240
in-memory session state         : 0
chaos kills per day             : 288
failed requests under the chaos test : 0
```

```
files written per pod per day   : 41000
megabytes per pod per day       : 380
days until disk pressure evicts : 34
```

```
pod restarts per month          : 8851
  from chaos or normal churn    : 8640
  from disk pressure            : 211
  share                         : 238 per ten thousand
alerts separating the two causes : 0
```

```
p99 on a warm pod, ms           : 120
p99 on a fresh pod, ms          : 890
  gap                           : 770 ms
```

```
the statelessness claim
  in-memory session state : 0
  sticky routing or affinity : none
  pods killed per day     : 288
  failed requests         : 0
  months at zero          : eleven
  verdict : STATELESS
```

```
  killing a pod every five minutes in production is a real
  test and almost nobody runs it
```

```
what the chaos test can observe
  a request in flight when a pod dies : retried elsewhere,
    and it succeeds
  what that proves : no request depends on memory in one
    process
  what it does not observe : the pods it did not kill, and
    what they have been accumulating
  the filesystem : writable, and never asserted about
```

```
  correctness under pod loss and independence from pod
  identity are different claims, and only the first was run
```

```
pod age as an input
  p99 on a pod minutes old : 890 ms
  p99 on a pod days old    : 120 ms
  difference               : 770 ms
  is the response different : no, the same bytes
  is the experience different : yes, and it depends on
    which pod answered
  what routing guarantees about that : nothing, by design
```

```
why the eviction is invisible
  restarts a month : 8851
  expected, from the chaos test and churn : 8640
  from disk pressure : 211
  alerts separating them : 0
  why a high restart count reads as healthy : because the
    team deliberately causes 288 of them a day
```

```
null control - a shared cache and a read-only container
  in-memory session state : 0, unchanged
  restarts from disk pressure : 0
  p99 on a fresh pod : 120 ms
  gap between fresh and warm : 0 ms
  the workers did not become more stateless; the state they
  had stopped being per pod and started having a name
```

```
what a passing chaos test guarantees
  no request depends on state in one process : exactly,
    proved 288 times a day for eleven months
  the workers are interchangeable             : not
    addressed; a process is not the only thing a pod has,
    and the test only ever destroys pods
```

```
statelessness is a claim about what a request reads, so it
has to name every store a request can read; a claim proved
by killing processes covers memory exactly and leaves the
disk under it untouched and accumulating
```

The workers hold 0 session state and a chaos test kills 288 pods a day with 0 failed requests, which almost nobody proves. A template cache writes 380 megabytes a pod a day to the container filesystem, so p99 depends on pod age - 890 ms against 120, a gap of 770 - and 211 of 8851 restarts a month, 238 per ten thousand, are evictions hidden inside a number the test inflates.

Verify it yourself:

```bash
pnpm eml run examples/the-worker-was-stateless-and-the-filesystem-was-not/the_worker_was_stateless_and_the_filesystem_was_not.eml
```
