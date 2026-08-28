# The throttle protected the service and moved the failure out

`the_throttle_protected_the_service_and_moved_the_failure_out.eml` - A rate limiter holds the service at its measured capacity. The service's error rate is zero and its latency is flat. What the system as a whole delivers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Shedding load at the edge is correct and it is the standard answer, for good reasons. A service that accepts more than it can serve does not serve more; it serves everything slowly, then times out, and a timeout costs the work already done plus the retry. Refusing early returns a clear signal to the caller while it can still act on it, and it keeps the accepted requests fast. The limit was set from a measured capacity, not a guess.

A rejection is a failure that has been moved rather than removed. The service stops recording it because the service is no longer where it happens. The caller records it, and the caller's response to it is a retry, which arrives as new offered load.

The limiter has no term for what the caller does next, so the loop it closes is not visible from either side alone.

```
capacity      : 2000 rps, measured
offered       : 2600 rps
rejected      : 600 rps
```

```
the service's own numbers
  requests served     : 2000 rps
  latency             : flat, it is never overloaded
  server error rate   : 0, a 429 is not a server error
  SLO                 : met
```

```
the caller's numbers
  requests refused    : 600 rps
  share refused       : 23 percent
```

```
each rejection is retried 3 times
  retry traffic added : 1800 rps
  offered, round two  : 4400 rps
  rejected, round two : 2400 rps
  rejections grew by  : 300 percent
```

```
  served, round one : 2000
  served, round two : 2000
  the served column does not move, which is the limiter working
```

```
round   offered   served   rejected
  1       2600      2000     600
  2       4400      2000     2400
  3       9800      2000     7800
  4       26000      2000     24000
```

```
  the limiter is doing exactly what it promised at every row
  and the rejected column is the input to the next row
```

```
  original demand        : 2600 rps of real work
  load reaching the limiter : 4400 rps
  of that, retries       : 1800 rps, none of it new work
  load multiplier        : 169 percent of the original
  every retry consumes a connection, a TLS handshake and a limiter
  decision, and none of them reach a worker
```

```
the same rejection, with a retry-after the caller honours
  retries within the second : 0
  offered                   : 2600 rps, unchanged
  rejected                  : 600 rps
  the demand is the same and the amplification is gone
  the limiter's job was to tell the caller something, and the number it
  needed to say is not in the status code
```

```
control - is the limiter doing its job
  requests admitted beyond capacity : 0
  latency excursions                : 0
  server errors                     : 0
  the service protected              : yes, completely
  defects in the limiter             : 0
```

```
  it protects the service, which is the thing it was asked to protect
  and nothing measures the pair
```

```
null control - the same limiter under capacity
  offered   : 1800 rps
  capacity  : 2000 rps
  rejected  : 0
  retries   : 0
  amplification : none
  same limiter, same threshold, same callers
  the loop needs a rejection to exist before it can begin
```

```
a failure that is moved rather than removed
  disappears from the mover's metrics    yes, immediately
  appears in the receiver's metrics      yes, and the receiver is elsewhere
  changes the receiver's behaviour       yes, and that behaviour returns
  the return path is what nobody owns
```

```
the measurement that closes it is not on either side
it is offered load against original demand, and neither party can
compute it alone
```

Shedding at the edge is the right answer and this limiter implements it correctly: the service never exceeds its measured capacity, latency never moves, and its error rate is zero because a 429 is not a server error. Each rejection is retried 3 times, so offered load reaches 4400 rps and rejections reach 2400 - 300 percent more than before - while the served column holds at 2000 and every SLO stays green.

Verify it yourself:

```bash
pnpm eml run examples/the-throttle-protected-the-service-and-moved-the-failure-out/the_throttle_protected_the_service_and_moved_the_failure_out.eml
```
