# The retry preserved the request and not the context

`the_retry_preserved_the_request_and_not_the_context.eml` - A caller gives the service 5 seconds. The service retries a failing downstream call up to four times. How long the caller waits is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Replaying the request body on retry is correct and it is what makes a retry a retry. The body is the thing that must not change: a retry that sent different bytes would be a different request, and the whole point is to give the same operation another chance at a transport that failed for reasons unrelated to it. The retry code copies the body exactly, and it is right to.

A deadline is not part of the body. It arrives as a header, it is consumed by the client library at the point of the call, and the retry loop sits ABOVE that library - so each attempt constructs a fresh call, and a fresh call is given the full timeout again.

Every individual attempt is inside its deadline. The caller's deadline is not a property of any attempt; it is a property of the whole operation, and no layer in this chain is holding it.

```
caller's deadline        : 5000 ms
attempts the service makes: up to 4
```

```
attempt   budget it is given   elapsed when it ends   inside its deadline
  1         5000 ms              5000 ms              yes
  2         5000 ms              10000 ms              yes
  3         5000 ms              15000 ms              yes
  4         5000 ms              20000 ms              yes
```

```
  server-side elapsed after 4 attempts : 20000 ms
  caller's budget                     : 5000 ms
  overrun                             : 4 times
```

```
  and every attempt was inside its own deadline, which is what each one
  was checked against
```

```
  caller waits           : 5000 ms, then gives up
  service keeps working  : 15000 ms more
  attempts made after the caller left : 3
  the first attempt is the only one anybody is waiting for
```

```
if the remaining budget were carried instead
attempt   remaining before   given   remaining after
  1         5000 ms          2500 ms    2500 ms
  2         2500 ms          1250 ms    1250 ms
  3         1250 ms          625 ms    625 ms
  4         625 ms          312 ms    313 ms
```

```
  attempts that fit inside the budget : 4
  total elapsed                       : 4687 ms
  overrun                             : 0 ms
```

```
carried by the retry, or not
  request body        carried, byte for byte
  idempotency key     carried, it is in the body
  remaining deadline  NOT carried, recomputed
  trace id            NOT carried, a new span is opened
  attempt number      NOT carried, downstream cannot see it is a retry
```

```
  the three that are lost are the three that describe the operation
  rather than the message, and an operation has no representation here
```

```
downstream, per caller request
  requests it receives      : 4
  requests it can link      : 1, they share no trace
  its measured request rate : 4 times the caller's
  its measured error rate   : unchanged, each failure is a separate request
```

```
control - is the retried request itself correct
  body identical to the original : yes, byte for byte
  idempotency key preserved      : yes
  method and path preserved      : yes
  fields that differ             : 0
  the retry is a faithful replay of the message
```

```
  and a message is not an operation
```

```
null control - the same loop when the first attempt succeeds
  attempts        : 1
  elapsed         : 5000 ms at worst
  overrun         : 0
  deadline carried: still not, and it does not matter
  every test that exercises the happy path is this case
```

```
what a retry must carry, and where each thing lives
  the message           in the body, and it is carried
  the deadline          in a header, consumed one layer down
  the trace             in a header, regenerated per call
  the attempt count     nowhere, it exists only in the loop variable
  a retry loop above the client library cannot see any of the last three
```

```
the deadline is the one that turns a local decision into a global one:
a budget that is not decremented is not a budget
```

Replaying the body byte for byte is what makes a retry a retry, and this one does it exactly. The deadline arrives as a header and is consumed by the layer below the retry loop, so each attempt is handed the full 5000 ms again. Four attempts spend 20000 ms against a 5000 ms budget, 3 of them after the caller has gone, and every single attempt was inside the deadline it was checked against.

Verify it yourself:

```bash
pnpm eml run examples/the-retry-preserved-the-request-and-not-the-context/the_retry_preserved_the_request_and_not_the_context.eml
```
