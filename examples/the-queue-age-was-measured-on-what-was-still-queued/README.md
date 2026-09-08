# The queue age was measured on what was still queued

`the_queue_age_was_measured_on_what_was_still_queued.eml` - The queue's oldest message is sampled every ten seconds and pages above five minutes, and it has caught eleven real stalls. What it can report is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The metric is the right one to have. It is not queue depth, which says nothing about whether anything is moving; it is the age of the oldest message, which is the quantity a consumer's latency actually depends on. It is sampled frequently enough to see a short stall, it pages rather than logging, and it has caught eleven stalls that would otherwise have been found by a customer.

Messages carry a fifteen minute time to live and the broker deletes them when it expires. The oldest message in the queue therefore cannot be older than fifteen minutes, and once a stall passes that, the metric stops rising.

The longest stall this year ran six hours.

```
sample interval, seconds        : 10
alert threshold, seconds        : 300
stalls the metric caught        : 11
```

```
message time to live, seconds   : 900
longest stall, seconds          : 21600
  of which the metric could rise: 900
  of which it could not         : 20700
  share of the stall it tracked : 416 per ten thousand
```

```
messages per month              : 84000000
  processed                     : 81600000
  expired unprocessed           : 2400000
  share                         : 285 per ten thousand
alerts on the expiry counter    : 0
```

```
the oldest-message age
  what it is not : queue depth, which says nothing about
    whether anything is moving
  what it is     : the quantity a consumer's latency
    depends on
  sampled every  : 10 seconds, often enough for a short stall
  on breach      : pages, does not log
  stalls caught  : 11
  verdict : THE RIGHT QUANTITY
```

```
  choosing age over depth is the decision that makes this
  metric worth having, and it was made deliberately
```

```
the measured population
  what it reads : the oldest message IN the queue
  what leaves the queue without being read : anything
    past 900 seconds, deleted by the broker
  so the maximum the metric can report : 900
  what happens after that in a stall : the oldest
    messages expire and the metric FALLS
  is the metric wrong : no; it reports the oldest thing
    that is there
```

```
  the quantity is right and the population it ranges over
  is emptied by the same condition it is measuring
```

```
the graph during the longest stall
  first 900 seconds : climbs, alerts, pages
  the remaining 20700 seconds : flat, then a sawtooth
    as the oldest expire
  what a responder reads from a flat line : it stopped
    getting worse
  what was happening : messages were being deleted at the
    rate they arrived
  share of the stall the metric could track : 
    416 per ten thousand
```

```
the expiry counter
  does it exist : yes, the broker exports it
  did it move during the stall : it was the only thing
    that did
  messages it counted last month : 2400000
  share of all messages : 285 per ten thousand
  alerts on it : 0
  which dashboard it is on : the broker's, not the
    service's
```

```
null control - alert on what left the queue unread
  oldest-message age : unchanged, still the right quantity
  alerts on the expiry counter : 1
  seconds of the stall with a moving signal : 
    21600
  the age metric did not improve; a second one appeared
  for the population the first one loses
```

```
what an oldest-message age guarantees
  the oldest message present is this old : exactly, every
    10 seconds, and it caught 11 real stalls
  the backlog is this old : not addressed; the metric
    ranges over what is still there, and a time to live
    removes the evidence at a fixed age
```

```
a maximum over a population is bounded by whatever bounds
the population; where the same condition that raises the
measurement also empties the set, the measurement stops at
the ceiling and then reports improvement
```

The metric is the right quantity - age rather than depth, sampled every 10 seconds, paging rather than logging, 11 real stalls caught. It reads the oldest message still in the queue, and a 900 second time to live deletes them, so of a 21600 second stall it could track 900 - 416 per ten thousand - while 2400000 messages a month leave unread under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-queue-age-was-measured-on-what-was-still-queued/the_queue_age_was_measured_on_what_was_still_queued.eml
```
