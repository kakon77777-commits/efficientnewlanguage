# The timeout was raised because it was the adjustable number

`the_timeout_was_raised_because_it_was_the_adjustable_number.eml` - The dependency got slower. The timeout was raised. How many calls that changed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Raising the timeout was the right move available. The dependency belongs to another team, the latency was real and not a defect, and the calls that were timing out were calls that would have succeeded given another two seconds. Failing them was worse than waiting for them.

The timeout is also the only number in the whole chain that the calling team can edit, so it is the number that gets edited whatever the problem turns out to be. What a raise does is move calls from one column to another; what it cannot do is make a call faster.

Each bucket of calls is counted under both settings.

```
calls per minute : 1280
```

```
                        timeout 1000ms   timeout 5000ms
  calls that fail       220              25
  calls that succeed    1060              1255
```

```
the raise turns 195 failures per minute into successes
and those calls were always going to succeed; they were being cut off
```

```
calls taking longer than 1000ms
  before the raise : 220
  after the raise  : 220
  the dependency was not touched, so this number cannot move
```

```
connection-time held, in call-milliseconds per minute
  at 1000ms : 870000
  at 5000ms : 1345000
  up by 475000, which is 54%
```

```
a pool of 200 connections
  connections busy on average, before : 14
  connections busy on average, after  : 22
  still inside the pool, with 178 to spare
```

```
calls still failing at 5000ms
  the 25 calls in the up-to-9000ms bucket
  raising again would take them, at the cost of holding for 9000ms
```

```
what could have been changed, and by whom
  the timeout            : the calling team
  the dependency latency : the owning team
  the call volume        : the calling team, but it is user traffic
  the pool size          : the calling team, and it moves the same cost
  one of those four is both owned here and free, and it is the one that moved
```

```
control - the same raise against a fast dependency
  calls : 900, failing before : 0, failing after : 0
  identical, so this service cannot show whether raising the timeout helps
```

The raise was correct and it recovered calls that deserved to succeed. It moved every one of them from the error column into the waiting column, and which column a call sits in is the part the calling team owns.

Verify it yourself:

```bash
pnpm eml run examples/the-timeout-was-raised-because-it-was-the-adjustable-number/the_timeout_was_raised_because_it_was_the_adjustable_number.eml
```
