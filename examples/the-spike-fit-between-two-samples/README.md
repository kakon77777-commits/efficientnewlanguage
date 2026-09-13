# The spike fit between two samples

`the_spike_fit_between_two_samples.eml` - The utilisation gauge stayed under its ceiling for the whole hour, and every sample it took was real. How often it samples, against how long the spike lasted, is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The gauge is honest. It reads a real utilisation counter, not a model; every sample is kept, none discarded; the ceiling is checked against each sample; and the sixty samples an hour are on a chart anyone can read.

It samples once every sixty seconds, and the spike lasted twenty.

```
sample interval                 : 60 seconds
samples in the hour             : 60
spike duration                  : 20 seconds
  began after a sample at       : 15 seconds
  ended at second               : 35
  quiet before the next sample  : 25 seconds
samples during the spike        : 0
requests dropped in the spike   : 9000
```

```
the utilisation gauge
  reads : a real counter, not a model
  samples kept : all of them
  ceiling : checked against each sample
  visibility : sixty samples an hour on a chart
  samples over the ceiling : 0
  verdict : UNDER THE CEILING
```

```
  keeping every sample rather than pre-averaging is the
  part done right here, and it is why a sustained climb
  would show
```

```
the twenty seconds nobody sampled
  the spike : began at second 15, ended at 
    35, inside one sample interval
  the sample before it : taken at second 0, quiet
  the sample after it : taken at second 60, quiet again
  samples that saw it : 0
  what the chart shows there : two calm readings and a
    straight line between them
```

```
the spike itself
  requests dropped : 9000
  the gauge's maximum for the hour : a calm sample
  is any sample wrong : no; each was real and under the
    ceiling
  did the ceiling hold : unknown; the gauge never looked
    when it mattered
  is the peak the maximum sample : only if a sample
    coincided with the peak
```

```
null control - report max-since-last-read, not instantaneous
  samples during the spike : 0, still zero
  samples that would report the peak : 
    1
  dropped requests it would reveal : 
    9000
  no request and no interval changed; each sample stopped
  being a single instant and started summarizing the gap
```

```
what an hour under the ceiling guarantees
  no sample the gauge took exceeded the ceiling : exactly,
    every sample kept and checked
  the peak was within limits : not addressed; the gauge is
    polled every 60s and the spike lasted 20s between two
    polls - 0 samples saw it while 9000 requests
    were dropped
```

```
a sample is a fact about an instant, and a maximum over samples is a fact about
those instants, not about the moments between them; an event shorter than the
interval lives entirely in the gaps the gauge does not measure
```

It reads a real counter, keeps every sample, and checks each against the ceiling - none over. It polls every 60s and the spike lasted 20s between two polls, so 0 samples caught it while 9000 requests were dropped in the gap the gauge never looked at.

Verify it yourself:

```bash
pnpm eml run examples/the-spike-fit-between-two-samples/the_spike_fit_between_two_samples.eml
```
