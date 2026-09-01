# The fallback was tested and the failover was not

`the_fallback_was_tested_and_the_failover_was_not.eml` - The fallback path is tested on every release and has never failed. How long an outage lasts is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The fallback works. A test in every release forces the primary to error, asserts the secondary answers, and checks the answer is correct rather than merely present. Sixty-two releases, three hundred and forty assertions each, no failure. When the request reaches the fallback, the fallback serves it.

"When the request reaches the fallback" is the whole of what is untested. The test injects the failure at the client, one layer above everything that has to happen in production before a request is routed anywhere else.

Detection, then a DNS record whose time to live nobody chose for this purpose, then a connection pool that holds established sockets until they error.

```
releases                       : 62
fallback assertions run        : 21080
fallback failures              : 0
```

```
detection, seconds             : 45
dns ttl, seconds               : 300
pool drain, seconds            : 90
seconds to reach the fallback  : 435
requests failed before then    : 5220000
```

```
the fallback test
  primary forced to error : yes
  secondary answered      : yes
  answer checked correct  : yes, not merely present
  runs per release        : 340
  failures in 62 releases   : 0
  verdict                 : FALLBACK WORKS
```

```
  every line is true, and the fallback does serve
  correctly the moment a request arrives at it
```

```
the layers between a failure and the fallback
  1. the primary fails
  2. something notices          : 45 s
  3. the record is republished  : 300 s of cached answers
  4. sockets already open error : 90 s
  5. a request reaches the fallback
```

```
  the test injects at step 5, which is where it is easy to
  inject and where nothing it measures lives
```

```
the ttl alone is : 6896 per ten thousand of the outage
```

```
the number that dominates
  dns ttl, seconds       : 300
  chosen for             : the platform default
  chosen by              : whoever created the record
  reviewed as a failover parameter : never
```

```
null control - the drill runs in production, ttl revisited
  fallback failures       : 0, unchanged
  seconds to reach it     : 165
  requests failed before  : 1980000
  the fallback did not improve; the path to it was
  measured for the first time
```

```
what a passing fallback test guarantees
  the secondary serves correctly : exactly
  an outage is short             : not addressed; the test
    starts where the outage ends, so its duration is the
    one quantity it cannot contain
```

```
testing the destination is not testing the journey; a drill
that injects at the client measures the half nobody was
worried about
```

The fallback works and 21080 assertions across 62 releases say so, with 0 failures and answers checked correct rather than merely present. Reaching it takes 435 seconds - detection, then a 300-second ttl that is 6896 per ten thousand of the outage and was never chosen as a failover parameter, then the pool - during which 5220000 requests fail at a service whose fallback is tested.

Verify it yourself:

```bash
pnpm eml run examples/the-fallback-was-tested-and-the-failover-was-not/the_fallback_was_tested_and_the_failover_was_not.eml
```
