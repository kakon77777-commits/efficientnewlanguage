# The breaker tripped on the limiters own rejections

`the_breaker_tripped_on_the_limiters_own_rejections.eml` - A rate limiter and a circuit breaker both protect the same downstream service. What each one sees, and what the pair sees, are computed separately below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both are correct. The rate limiter keeps the downstream inside a contract it actually signed, and it has prevented three overload incidents. The circuit breaker stops a failing dependency from consuming every worker, and it has prevented two cascades. Either one alone is a good control, and the teams that added them added them for measured reasons.

The breaker's input is the error rate. The limiter's output, when it rejects, is an error. So the limiter's own protective action is indistinguishable, at the breaker's input, from the downstream failing. The two are wired in series and one of them cannot tell the other's success from a fault.

Requests are classified by what actually happened to them.

```
minute   offered   admitted   rejected by limiter   downstream failures   breaker sees
  t+0     400      400        0                  4                   1% closed
  t+1     900      500        400                  5                   45% closed
  t+2     1400      500        900                  5                   64% OPEN
  t+3     1600      500        1100                  5                   69% OPEN
  t+4     1500      500        1000                  5                   67% OPEN
  t+5     900      500        400                  5                   45% closed
```

```
breaker threshold : 50% error rate
minutes the breaker opened : 3 of 6
```

```
across the window
  errors from the limiter doing its job : 3800
  errors from the downstream failing    : 29
  the breaker counts both as one number : 3829
  99% of what tripped the breaker was the other safeguard working
```

```
the state the pair reaches
  breaker open  : no traffic reaches the downstream
  limiter sees  : offered load unchanged, it is upstream of the breaker
  downstream    : idle, and healthy, and receiving nothing
  the breaker's close condition is a fall in the error rate, and the error
  rate is now produced entirely by the limiter, which is not affected by
  the breaker being open
```

```
what would close the breaker
  t+0 : offered 400 under the cap 500, error rate 1%
  so it closes when offered load falls below the cap, which is a property
  of the callers rather than of the downstream's health
```

```
the same six minutes with only the limiter
  requests served : 2900
  downstream load : never above 500
```

```
the same six minutes with only the breaker
  requests served : 6700
  breaker trips   : 0, because the real failure rate is 1%
```

```
the two together
  requests served : 1400
  limiter alone   : 2900
  breaker alone   : 6700
  the pair serves 1500 fewer than the weaker-looking single control
```

```
what the breaker would need
  a rejection carries : HTTP 429, generated locally, downstream untouched
  a real failure carries : HTTP 5xx, generated downstream
  the two are distinguishable at the point the breaker samples
  sites where the breaker's input filters on that distinction : 0
  the information is present and the control does not read it
```

```
control - the same six minutes, breaker counting 5xx only
  breaker trips   : 0
  requests served : 2900
  against 1400 with the shared counter
  the same two controls, the same load, 1500 more requests served,
  and the only change is which errors the breaker is allowed to see
```

Both controls are correct and each has prevented real incidents. They are wired in series, and the first one's success looks exactly like the second one's fault at the point where the second one decides.

Verify it yourself:

```bash
pnpm eml run examples/the-breaker-tripped-on-the-limiters-own-rejections/the_breaker_tripped_on_the_limiters_own_rejections.eml
```
