# The slo was met over a window with no requests

`the_slo_was_met_over_a_window_with_no_requests.eml` - The latency SLO reads 100 per hundred met for the hour under review, and the computation is honest. How many requests that hour is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The SLO is measured well. It counts real requests against the threshold, not a synthetic probe; a request over the threshold counts as a miss; the window is the clock hour, not a rolling one chosen afterwards; and a miss rate above the budget pages on-call.

The hour under review had no requests, and zero misses over zero requests is reported as fully met.

```
requests in the hour            : 0
  over the threshold            : 0
  under the threshold           : 0
reported SLO met                : 10000 per ten thousand
alerts that fired               : 0
minutes the service was unreachable : 40
share of the hour unreachable   : 6666 per ten thousand
```

```
the latency SLO
  counts : real requests against the threshold
  a slow request : counts as a miss
  window : the clock hour, not a rolling one
  pages when : the miss rate exceeds the budget
  requests over the threshold : 0
  verdict : 100 PER HUNDRED MET
```

```
  counting real requests rather than a synthetic probe is
  the part done right here, and it is why a real slow hour
  would show
```

```
met = (requests under threshold) / (requests)
  requests this hour : 0
  misses this hour : 0
  the ratio : zero over zero, reported as fully met
  what '100 per hundred met' of no requests means : every
    one of no requests was fast, trivially
  what it does not mean : that the service served anyone
```

```
the empty hour
  why no requests : the service was unreachable for 
    40 minutes, and the load balancer shed the rest
  what an outage looks like to a per-request SLO : an
    hour with no misses
  did availability enter this metric : no; it is over
    served requests
  is the SLO figure false : no; it is vacuously true
```

```
null control - an empty window is not a met SLO
  SLO when empty reads as met : 10000
  SLO when empty is undefined : 0
  availability alerts on an empty window : 
    1
  no request changed; an hour with no traffic stopped
  counting as an hour that met its latency target
```

```
what a met latency SLO guarantees
  no served request exceeded the threshold : exactly,
    real requests, clock hour, budget armed
  the service met its target : not addressed; the window
    had no requests, and zero misses over zero requests is
    vacuously 100 per hundred - the service was unreachable
    40 minutes and the metric fired no alert
```

```
a per-request quality metric is silent when there are no requests, and silence
reads as perfection; the hour a service serves no one is the hour its latency
SLO looks best
```

It counts real requests against the threshold over the clock hour and pages on a miss - 100 per hundred met. The hour had 0 requests, so zero misses over zero is vacuously met while the service was unreachable 40 minutes, 6666 per ten thousand of it, under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-slo-was-met-over-a-window-with-no-requests/the_slo_was_met_over_a_window_with_no_requests.eml
```
