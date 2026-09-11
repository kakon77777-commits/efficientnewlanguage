# The uptime was measured from inside the service

`the_uptime_was_measured_from_inside_the_service.eml` - The uptime monitor recorded no failed checks all month, and every check it recorded is true. What it could not record is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The monitoring is set up carefully. It checks once a minute; a failed check pages on-call; the threshold for "down" is a single miss, not a streak; and the history is kept for a year so trends are visible.

The monitor process runs on the same rack as the service it watches.

```
checks in the month             : 43200
  that ran                      : 43055
  that never ran                : 145
  that recorded a failure       : 0
reported uptime                 : 10000 per ten thousand
```

```
minutes the rack lost power     : 145
minutes the service was up      : 43055
real uptime                     : 9966 per ten thousand
off-rack monitors               : 0
```

```
the uptime monitor
  how often : once a minute
  on a failed check : it pages on-call
  threshold for down : one miss, not a streak
  history kept : a year
  checks that recorded a failure : 0
  verdict : UP
```

```
  paging on a single miss is the part almost nobody dares
  to configure, and it is why a gap here is trusted
```

```
the missing checks
  minutes with no check recorded : 
    145
  why they are missing : the monitor lost power with the
    service, on the same rack
  how the dashboard reads a gap : as up, not as unknown
  fraction of minutes actually observed : 
    9966 per ten thousand
  monitors that would have survived the outage : 
    0
```

```
the outage the monitor slept through
  minutes the rack was dark : 145
  checks that fired during it : 0
  pages sent : 0
  what the year of history shows there : nothing, which
    renders as up
  real uptime once the gap is counted down : 
    9966 per ten thousand
```

```
null control - a monitor off the rack, gaps as unknown
  same-rack uptime : 10000, unchanged
  off-rack uptime : 
    9966 per ten thousand
  minutes it would have flagged : 
    145
  nothing about the outage changed; the recorder stopped
  sharing the failure it was there to catch
```

```
what a month of clean checks guarantees
  every check that ran returned healthy : exactly, all 
    43055 of them, paging armed on a single miss
  the service was up : not addressed; the monitor shares
    the rack, so the one event that takes the service down
    takes the recorder with it, and 145 missing
    checks read as up rather than as unknown
```

```
a recorder inside the failure domain cannot report the
failure that stops it; the absence of a bad record is not a
good record, unless something survived to write it
```

It checks every minute, pages on a single miss, and keeps a year of history - 10000 per ten thousand, no failure recorded. The monitor is on the same rack, so 145 minutes of lost power left 145 checks unrun and unpaged, read as up, putting real uptime at 9966 per ten thousand under 0 off-rack monitors.

Verify it yourself:

```bash
pnpm eml run examples/the-uptime-was-measured-from-inside-the-service/the_uptime_was_measured_from_inside_the_service.eml
```
