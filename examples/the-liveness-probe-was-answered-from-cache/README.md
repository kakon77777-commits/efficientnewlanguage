# The liveness probe was answered from cache

`the_liveness_probe_was_answered_from_cache.eml` - The liveness probe has returned 200 on every check for the whole day, and each 200 is true. What the probe actually exercised is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The probe is wired the way the runbook says. It hits an HTTP endpoint on the service itself rather than pinging the host; it runs every ten seconds from an external checker; a non-200 restarts the process; and the endpoint is cheap on purpose so the check never adds load.

The endpoint answers by reading a flag a heartbeat thread refreshes. The heartbeat is not the request-processing loop.

```
probes in the day               : 8640
  that got 200                  : 8640
  that exercised the work path  : 0
reported uptime                 : 10000 per ten thousand
```

```
minutes in the day              : 1440
  the request loop ran          : 1220
  the request loop was wedged   : 220
requests in the day             : 720000
  lost while wedged             : 110000
  served                        : 610000
real availability               : 8472 per ten thousand
```

```
the liveness probe
  what it hits : an endpoint on the service, not a host
    ping
  how often : every ten seconds, externally
  on a non-200 : the process is restarted
  cost : cheap on purpose, so it adds no load
  checks that got 200 : 8640
  verdict : ALIVE
```

```
  restarting on a non-200 is the part almost nobody wires
  up, and it is why a red probe here is believed
```

```
the endpoint's answer
  what it returns : a flag refreshed by a heartbeat
    thread
  what refreshes the flag : a timer, not an arriving
    request
  seconds it kept answering from a stale flag : 
    13200
  probes that ran a real request : 
    0
  a cheap endpoint and the work path : share only the
    process, not the code that was stuck
```

```
the callers during the wedge
  minutes their requests hung : 220
  requests lost in those minutes : 110000
  what the status page showed : ALIVE, uninterrupted
  restarts triggered on their behalf : 0
  real availability they saw : 
    8472 per ten thousand
```

```
null control - a probe that waits for a served request
  shallow probe uptime : 10000, unchanged
  deep probe uptime : 
    8472 per ten thousand
  probes that would have failed : 
    1320
  nothing about the outage changed; the check stopped
  reading a flag and started doing the work
```

```
what a passing liveness probe guarantees
  the endpoint it hits returned 200 : exactly, every
    ten seconds, all 8640 of them
  the service is doing its work : not addressed; the 200
    is a flag a heartbeat writes, and the heartbeat kept
    running while the request loop was wedged for 
    220 minutes
```

```
a probe measures the path it takes, and a path chosen to be
cheap is chosen to avoid the work; a check that must not add
load is a check that does not exercise the load
```

It hits the service not the host, runs every ten seconds, and restarts on a non-200 - 10000 per ten thousand, every probe green. The 200 is a heartbeat's flag, so the request loop was wedged for 220 minutes, lost 110000 requests, and left real availability at 8472 per ten thousand under 0 probes that ran the work.

Verify it yourself:

```bash
pnpm eml run examples/the-liveness-probe-was-answered-from-cache/the_liveness_probe_was_answered_from_cache.eml
```
