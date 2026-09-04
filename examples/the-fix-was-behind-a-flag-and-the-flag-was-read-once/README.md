# The fix was behind a flag and the flag was read once

`the_fix_was_behind_a_flag_and_the_flag_was_read_once.eml` - The fix is behind a flag and the flag service propagates a change in thirty seconds. How long turning it on takes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the fix behind a flag was right. It is a behavioural change to a hot path, the flag lets it be turned off without a deploy, the incident procedure names the flag, and the flag service is fast and reliable: a change is visible to a client that asks within thirty seconds, measured.

The application reads the flag once, at start-up, into a module-level constant. That was a deliberate performance decision — a hot path should not make a lookup per request — and it is why the flag's propagation time is not the application's.

The processes were started an average of nine hours ago.

```
flag service propagation, seconds : 30
flag service outages this year    : 0
```

```
pods                              : 240
pod recycle, hours                : 6
mean hours since a pod started    : 3
mean seconds until a pod sees it  : 10800
seconds until every pod sees it   : 21600
actual over advertised            : 360 times
```

```
the flag service
  propagation to a client that asks, seconds : 30
  measured rather than advertised : measured
  outages this year : 0
  the incident procedure names this flag : yes, in 
    41 steps across the runbooks
  verdict           : FAST
```

```
  the number is real; the service is not the slow part
```

```
how the application reads it
  when              : once, at start-up
  into              : a module-level constant
  why               : a hot path should not do a lookup per
    request, and that reasoning is correct
  how a running process learns of a change : it does not
  what makes it learn : being replaced
```

```
  the caching decision and the propagation number are both
  right, and they describe different systems
```

```
the incident step
  action              : turn off the flag
  the service confirms: immediately
  behaviour stops on a pod : when that pod restarts
  a step saying to restart the fleet : none
  what an operator sees after the step : the flag off and
    the symptom continuing
```

```
the advertised time as a share of the real one : 27 per ten thousand
```

```
null control - the SDK's background refresh, read per request
  lookups added to the hot path : none, the value is local
  seconds until every pod sees it : 30
  pods still on the old value after a minute : 0
  the flag service did not get faster; the application
  started being one of its clients
```

```
what a fast flag service guarantees
  a client that asks gets the new value quickly : exactly
  the behaviour changes quickly                 : not
    addressed; that depends on how often the application
    asks, and reading once is a decision made for a
    different reason in a different file
```

```
a propagation time is a property of a distribution channel;
the number an operator needs is the one that ends at the
behaviour, and it is the channel's time plus whatever the
reader's caching adds
```

The flag service is fast and reliable: 30 seconds to a client that asks, measured, with 0 outages this year, and 41 runbook steps name this flag. The application reads it once at start-up for a good reason, so with pods recycling every 6 hours a change reaches the mean pod in 10800 seconds and the last one in 21600 - 360 times the advertised figure, which is 27 per ten thousand of the real one - while the runbook step reads as a single action.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-was-behind-a-flag-and-the-flag-was-read-once/the_fix_was_behind_a_flag_and_the_flag_was_read_once.eml
```
