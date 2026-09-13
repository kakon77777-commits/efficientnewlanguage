# The missing metric was read as zero

`the_missing_metric_was_read_as_zero.eml` - The load alert has not fired in the sixty minutes under review, and every sample it read was under the threshold. What a sample that was not read counts as is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The alerting is set up properly. It reads a real requests-per-second gauge, not a synthetic probe; it checks every minute; it fires the moment a sample exceeds the threshold; and the rule is armed, tested, and paging on-call.

A minute with no sample is recorded as zero.

```
minutes in the window           : 60
  a sample arrived              : 42
  the exporter was down         : 18
  recorded as zero              : 18
alert threshold                 : 500 rps
alerts that fired               : 0
```

```
while the exporter was down
  actual load                   : 1400 rps
  recorded load                 : 0 rps
  over the threshold by         : 900 rps
absence, as a share of the window : 3000 per ten thousand
```

```
the load alert
  reads : a real requests-per-second gauge
  how often : every minute
  fires when : a sample exceeds the threshold
  armed : tested, paging on-call
  samples over the threshold : 0
  verdict : WITHIN LIMITS
```

```
  firing on a single sample rather than a sustained
  average is the part done right here, and it is why a
  real spike would page
```

```
the eighteen minutes with no sample
  why they are missing : the exporter was down, not the
    service
  what the collector stored for them : zero
  what zero reads as : no load
  what the load actually was : 1400 rps
  samples that exceeded the threshold : none, because
    zero never does
```

```
the overload that did not page
  minutes at 1400 rps : 18
  the threshold : 500 rps
  over it by : 900 rps, every one of those minutes
  pages sent : 0
  is the alert rule wrong : no; no sample it saw
    exceeded the threshold
  is the data it saw the data that happened : no
```

```
null control - absence recorded as unknown, not zero
  alerts when absence is zero : 0
  alerts when absence is unknown : 1
  minutes flagged as no-data : 18
  no request and no threshold changed; the gap stopped
  being reported as a low reading and started being
  reported as no reading
```

```
what a quiet load alert guarantees
  no sample the collector read exceeded the threshold :
    exactly, every minute, paging armed
  the load stayed within limits : not addressed; a missing
    sample was recorded as zero, and zero reads as no
    load - 18 minutes at 1400 rps were stored as 0 and
    alerted on nothing
```

```
absence and zero are different readings, and a store that cannot tell them
apart turns a blind instrument into a calm one; the lowest possible value is
exactly what a stopped sensor reports
```

It reads a real gauge every minute and fires on a single exceedance - no sample over 500 rps, no page. A missing minute is stored as zero, so 18 minutes at 1400 rps read as no load, 3000 per ten thousand of the window recorded as calm under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-missing-metric-was-read-as-zero/the_missing_metric_was_read_as_zero.eml
```
