# The timeout was set and the pool had its own

`the_timeout_was_set_and_the_pool_had_its_own.eml` - Every outbound call has an explicit timeout and a lint rule fails the build without one. What that timeout bounds is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The timeout discipline is real and it is enforced by a machine. There is no unbounded wait anywhere in the service; the value was chosen from the dependency's measured p99 plus headroom rather than picked round; it is set per call site rather than globally, so a slow endpoint does not raise the bound for a fast one; and a lint rule fails the build on any client constructed without one. Two hundred fourteen call sites, all covered.

The timeout starts when the request is handed to the transport. Before that the transport waits for a free connection, and the wait for a pool slot is governed by the pool's own limit, which nobody set.

The library's default acquire timeout is thirty seconds.

```
call sites                      : 214
  with an explicit timeout      : 214
  without one                   : 0
  with an explicit acquire timeout : 0
```

```
request timeout, ms             : 250
pool acquire timeout, ms        : 30000
worst case wait, ms             : 30250
  bounded by the chosen value   : 82 per ten thousand
observed p99 under saturation, ms : 8400
```

```
pool size                       : 20
calls per day                   : 6200000
  the timeout describes         : 6126000
  pool wait exceeded it         : 74000
  share                         : 119 per ten thousand
```

```
the timeout rule
  unbounded waits in the service : 0
  where the value came from : the dependency p99 plus
    headroom, measured
  set per call site or globally : per call site
  enforced by : a lint rule that fails the build
  call sites covered : 214 of 214
  verdict : BOUNDED
```

```
  a machine-enforced rule beats a convention, and choosing
  per call site beats one global number
```

```
the timer
  starts when : the request is handed to the transport
  what happens before that : the transport waits for a
    free connection from the pool
  who bounds that wait : the pool, from its own setting
  what that setting is : 30000 ms, the library default
  call sites that set it : 0
  what the lint rule checks : the request timeout
```

```
  the covered quantity is real and it is the second of the
  two waits, and the multiple between them is below
```

```
the two waits compared
  request timeout, ms : 250, chosen
  acquire timeout, ms : 30000, inherited
  multiple            : 120
```

```
when the pool wait is nonzero
  connections free : the wait is zero and the chosen
    timeout is the whole bound
  pool full        : the wait is the queue for a slot
  when the pool fills : when calls stop returning quickly
  which is           : the condition the timeout exists for
  so the two are     : correlated, not independent
```

```
what the timeout metric counts
  requests cut at the chosen value : counted, and correct
  requests waiting for a slot      : not yet issued, so
    not in the metric
  where they appear instead : the caller's own latency,
    as 8400 ms at p99 under saturation
  calls a day in that state : 74000
```

```
null control - one deadline covers acquire and request
  call sites covered : 214, unchanged
  worst case wait, ms : 250
  calls exceeding the deadline : 0
  the timeout did not get shorter; it started covering the
  whole interval the caller is waiting through
```

```
what an explicit timeout guarantees
  this request will not run longer than the value : exactly,
    at every one of 214 call sites
  the caller will not wait longer than the value  : not
    addressed; the value bounds an operation that has not
    started, and getting to the start is also waiting
```

```
a timeout is a bound on an interval, so it is only as good
as the interval it is attached to; a lint rule that finds
every missing timeout finds every missing one of the kind it
knows to look for
```

Every one of 214 call sites has an explicit timeout, chosen from a measured p99 and enforced by a lint rule that fails the build - 0 unbounded waits. It starts when the request reaches the transport, after a pool wait bounded by an inherited 30000 ms that 0 call sites set, so the chosen value bounds 82 per ten thousand of a 30250 ms worst case, and 74000 calls a day - 119 per ten thousand - wait longer to start than they were allowed to run.

Verify it yourself:

```bash
pnpm eml run examples/the-timeout-was-set-and-the-pool-had-its-own/the_timeout_was_set_and_the_pool_had_its_own.eml
```
