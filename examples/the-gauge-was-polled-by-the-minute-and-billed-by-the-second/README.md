# The gauge was polled by the minute and billed by the second

`the_gauge_was_polled_by_the_minute_and_billed_by_the_second.eml` - The bandwidth monitor showed a comfortable peak under the alert threshold all month, and every sample it took was real. What resolution the monitor reads at, against what resolution the bill is computed at, is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The monitor is honest. It reads a real interface counter, not an estimate; every sample is kept; the alert compares each sample to the threshold; and the monthly peak on the chart is the true maximum of those samples.

The monitor polls once a minute, and the bill is computed on the per-second peak.

```
monitor poll interval           : 60 seconds
bill measurement interval       : 1 second
  bill samples per monitor sample : 60
monitored peak                  : 400 mbps
billed peak                     : 950 mbps
  gap                           : 550 mbps
alert threshold                 : 800 mbps
  billed peak over it by        : 150 mbps
burst duration                  : 5 seconds
alerts that fired               : 0
```

```
the bandwidth monitor
  reads : a real interface counter, not an estimate
  samples kept : all of them
  alert : each sample compared to the threshold
  monthly peak : the true maximum of the samples
  samples over the threshold : 0
  verdict : UNDER THE THRESHOLD
```

```
  the charted peak being the real max of real samples is
  the part done right here, and it is why the monitor is
  not smoothing the peak away by averaging
```

```
monitor and bill, side by side
  the monitor reads : once every 60 seconds
  the bill reads : the peak over every 1 second
  a 5-second burst : is one data point to the bill and
    invisible between the monitor's samples
  the monitor's max : 400 mbps, a calm minute
  the bill's max : 950 mbps, the burst
```

```
the invoice, on the per-second peak
  peak it billed : 950 mbps
  over the alert threshold by : 
    150 mbps
  what the monitor warned about it : nothing; its max was
    400
  is any monitor sample wrong : no; each is a real reading
  is the monitored peak the billed peak : no; they read
    at different resolutions
```

```
null control - monitor the per-second max since last read
  instantaneous monitored peak : 
    400 mbps
  max-since-last-read peak : 
    950 mbps
  alerts it would raise : 1
  no byte and no poll interval changed; the monitor's
  reading stopped being coarser than the bill's
```

```
what a peak under the threshold guarantees
  no monitor sample exceeded the threshold : exactly,
    real counter, every sample kept and checked
  the bandwidth stayed under the threshold : not
    addressed; billing is on the per-second peak and
    monitoring polls per minute - a 5-second burst hit 
    950 (billed) while the per-minute max was 400
    (monitored), under 800
```

```
two instruments on one quantity at different resolutions do not measure the
same thing; the peak is real at the bill's resolution and absent at the
monitor's, and the money follows the finer one
```

It reads a real counter, keeps every sample, and charts the true max - none over 800 mbps. It polls per minute while the bill is the per-second peak, so a 5-second burst billed at 950 never showed above the monitored 400, a 550 mbps gap, under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-gauge-was-polled-by-the-minute-and-billed-by-the-second/the_gauge_was_polled_by_the_minute_and_billed_by_the_second.eml
```
