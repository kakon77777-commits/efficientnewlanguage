# The limit was on concurrency and the work was queued

`the_limit_was_on_concurrency_and_the_work_was_queued.eml` - The downstream never sees more than thirty-two concurrent requests and it never has. What a caller waits is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The concurrency limit is correct and it saved the downstream. Thirty-two was measured, not guessed: above it the downstream's latency rose superlinearly and at forty it fell over. The semaphore is acquired and released in a finally, so a panic cannot leak a permit, and a soak test confirmed the count never exceeds the limit over eight hours.

A request over the limit does not fail. It waits, in an unbounded queue, with no deadline — which is what makes the protection perfect and is the whole of the problem.

Arrivals are four hundred and eighty a second and the limit serves two hundred and sixty-six.

```
concurrency limit          : 32
downstream service time, ms: 120
served per second          : 266
arrivals per second        : 480
overflow per second        : 214
```

```
after a 60 second burst
  queued                   : 12840
  wait at the back, seconds: 48
  queue bound              : 0, meaning none
  times the limit was exceeded : 0
```

```
the semaphore
  limit measured, not guessed : yes, the downstream falls
    over at 40 and degrades above 32
  acquired and released in a finally : yes, a panic cannot
    leak a permit
  soak test over eight hours  : never exceeded
  times exceeded in production: 0
  verdict                     : LIMITED
```

```
  the downstream is genuinely protected and removing this
  would take it down
```

```
a request that cannot get a permit
  rejected            : no
  given a deadline    : no
  counted             : no, the queue has no metric
  what it does        : waits
  what the caller sees: a request in flight
```

```
  the protection is perfect because nothing is refused,
  and nothing is refused because the queue is unbounded
```

```
share of arrivals that must wait : 4458 per ten thousand
```

```
the two dashboards
  downstream : latency flat, errors zero, concurrency at
    exactly 32
  caller     : latency climbing without bound
  a panel showing the queue : none exists
  which team owns which : different teams
```

```
null control - a bounded queue with a deadline
  times the limit was exceeded : 0, unchanged
  queue bound                  : 532
  refused per second           : 214
  wait at the back, seconds    : 2
  the downstream is no better protected; the overflow
  became visible and answerable instead of pending
```

```
what a concurrency limit guarantees
  the downstream sees at most N at once : exactly
  the system degrades gracefully        : not addressed;
    where the excess goes is a separate decision, and an
    unbounded queue is the default nobody chose
```

```
limiting is half a policy; the other half is what happens to
what is over the limit, and a queue with no bound and no
deadline converts a rejection into a latency nobody has a
metric for
```

The limit holds and the downstream is protected: 32 measured rather than guessed, released in a finally, 0 exceedances in production or in an eight-hour soak. It serves 266 a second against 480 arriving, so 4458 per ten thousand must wait, and after 60 seconds 12840 requests are queued with nothing bounding them and 48 seconds of wait at the back, on a queue that has no panel.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-on-concurrency-and-the-work-was-queued/the_limit_was_on_concurrency_and_the_work_was_queued.eml
```
