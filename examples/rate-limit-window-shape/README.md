# Rate limit window shape — three limiters, three actual limits

`rate_limit_window_shape.eml` replays a boundary-exploiting client through
a fixed window, a sliding window and two token buckets, and reports the
largest number of requests admitted in **any** 60-tick span.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the configured limit and the enforced limit are
different numbers, and the difference is a property of the window shape
rather than a bug.

A fixed window resets on a calendar boundary, so a client can send the full
quota at 0:59 and again at 1:00 — twice the stated rate, inside one second,
with every individual minute within limit. The measurement finds it:

```
the real limit each one enforces, in the worst 60-tick window:
  fixed       20 <- above the configured limit
  sliding     10
  bucket-10   11 <- above the configured limit
```

`bucket-10`'s 11 is not a defect — a token bucket bounds the *burst* to its
capacity and refills continuously, so a full bucket plus a refill inside
the window legitimately exceeds the per-window count. The output states it
rather than flagging it as a violation.

**A wrong premise this case caught**: the first version asserted that the
sliding window admits a "compliant" steady client in full — while sending
one request every three ticks, i.e. 20 per 60-tick window against a limit
of 10. The client was not compliant, so the check was asserting that a
correct limiter fails to limit. The steady client is now one request every
seven ticks (~8.5 per window), and the comment records what went wrong.

Verify it yourself:

```bash
pnpm eml run examples/rate-limit-window-shape/rate_limit_window_shape.eml
```

```bash
pnpm eml trace examples/rate-limit-window-shape/rate_limit_window_shape.eml --run
```
