# The freshness was measured from publish not event

`the_freshness_was_measured_from_publish_not_event.eml` - The dashboard data has been under its three-second freshness SLA all quarter, and the number is real. What instant freshness is measured from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The freshness metric is honest about the pipeline. It times from when the record was published to when it is read; it uses a monotonic clock so the figure cannot go negative; it is measured on every read, not sampled; and the SLA is enforced with an alert.

Freshness is measured from publish time, and the source lags publish.

```
publish-to-read                 : 3 seconds
freshness SLA                   : 60 seconds
  headroom the metric shows     : 57 seconds
```

```
event-to-publish lag            : 1800 seconds
event-to-read (true age)        : 1803 seconds
  age the metric cannot see     : 1800 seconds
  true age over the SLA by      : 1743 seconds
```

```
the freshness metric
  times from : publish to read
  clock : monotonic, cannot go negative
  measured on : every read, not sampled
  enforced by : an alert on the SLA
  reads inside the SLA : all of them
  verdict : FRESH
```

```
  measuring on every read rather than sampling is the
  part done right here, and it is why the three seconds is
  not a lucky sample
```

```
the clock's start point
  when the timer starts : at publish
  when the event happened : 1800 seconds before publish
  what the pipeline's own speed measures : the pipeline,
    not the world
  so a fast pipeline on stale input : reads as fresh
  the age nobody is timing : 1800 seconds
```

```
the action taken on the dashboard
  what it assumes : the data is 3 seconds old
  what it is acting on : a 1803-second-old world
  over the SLA the action trusts by : 
    1743 seconds
  is the freshness figure wrong : no; publish-to-read is
    exactly three seconds
  is it the age the decision needs : no
```

```
null control - time from the event, not from publish
  publish-based freshness : 3 seconds, unchanged
  event-based freshness : 1803 seconds
  SLA breaches it would show : 1
  no record and no clock changed; the start point moved
  from when the pipeline emitted to when the world acted
```

```
what a met freshness SLA guarantees
  the record is read soon after it is published : exactly,
    3 seconds, monotonic, every read, alerted
  the data reflects a recent world : not addressed; age is
    measured from publish, and the source lags publish by
    1800 seconds, so an event is 1803 seconds old when
    it looks 3
```

```
freshness is an interval, and an interval is only as good as the instant it
starts from; timing from publish measures how fast the pipeline forgets, not
how recently the world was seen
```

It times publish-to-read on a monotonic clock, every read, alerted - 3 seconds, under SLA. The clock starts at publish, which lags the event by 1800 seconds, so the data acted on is 1803 seconds old - 1743 over the SLA - while the metric reads 3.

Verify it yourself:

```bash
pnpm eml run examples/the-freshness-was-measured-from-publish-not-event/the_freshness_was_measured_from_publish_not_event.eml
```
