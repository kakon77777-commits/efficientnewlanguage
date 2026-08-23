# The limit was raised and the polling followed it

`the_limit_was_raised_and_the_polling_followed_it.eml` - A rate limit was raised from 60 to 300 requests a minute. What the callers did with the extra allowance is computed below, alongside how often the answer had changed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Raising the limit was correct. Four integrators were being throttled during their morning sync, the throttles were producing retries, the retries were producing support tickets, and the service had headroom it was not using. Removing a limit that is generating work for everybody is a good change.

A polling client has no natural interval. It has a limit, and it polls at whatever the limit permits, because a client author who leaves allowance unused gets stale data for no reason. The limit was not restraining an independent demand - it was setting one.

The polls and the changes are counted separately below.

```
caller    polls/min before   after   seconds between real changes
  alpha     60                 300     900
  bravo     58                 300     900
  charlie     60                 290     900
  delta     12                 12     900
  echo     60                 300     60
```

```
limit  : 60 -> 300 requests a minute
polls  : 250 -> 1202 a minute, 480 per 100
```

```
callers polling within 5% of the limit
  before : 4 of 5
  after  : 4 of 5
  the same callers sit against the limit at either value, which is what a
  limit-shaped demand looks like
```

```
polls a minute that can return something new
  alpha : 300 polls, at most 1 can differ from the one before
  bravo : 300 polls, at most 1 can differ from the one before
  charlie : 290 polls, at most 1 can differ from the one before
  delta : 12 polls, at most 1 can differ from the one before
  echo : 300 polls, at most 300 can differ from the one before
  informative polls a minute : 64 -> 304
  total polls a minute       : 250 -> 1202
  the informative count is a property of how often the data changes, so
  raising the limit did not move it
```

```
identical responses per minute
  before : 186 of 250, 74%
  after  : 898 of 1202, 74%
  added by the change : 712 identical responses a minute
  which is 1025280 a day
```

```
the problem the change was made to fix
  callers being throttled before : 4
  throttles now                  : 0
  retries caused by throttling   : 0
  support tickets from throttling: 0
  every one of those is a real improvement and none of them came back
```

```
the freshness it was supposed to buy
  alpha : data changes every 900s, polled every 200ms
  bravo : data changes every 900s, polled every 200ms
  charlie : data changes every 900s, polled every 206ms
  delta : data changes every 900s, polled every 5000ms
  a client polling faster than the data changes learns nothing on the
  extra polls, and the interval is set by the limit rather than by the
  change rate, which nobody on the caller side can see
```

```
the one caller whose rate did not change
  delta : 12 polls a minute before and after
  it polls on a schedule of its own rather than against the limit
  its share of the traffic : 4% before, 0% after
```

```
control - echo, data changes every 60s
  polls that can differ from the previous one : 300 of 300
  before the change : 60 of 60
  here every extra poll can return something new, so the raise bought
  exactly what it looked like it was buying
```

Raising the limit removed real throttling, real retries and real tickets, and none of those came back. A polling client polls at its limit, so the limit set the demand, and 74% of the responses are now identical.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-raised-and-the-polling-followed-it/the_limit_was_raised_and_the_polling_followed_it.eml
```
