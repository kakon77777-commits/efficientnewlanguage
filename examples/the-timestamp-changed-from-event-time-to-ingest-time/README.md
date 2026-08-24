# The timestamp changed from event time to ingest time

`the_timestamp_changed_from_event_time_to_ingest_time.eml` - A field called occurred_at changed from the time the event happened to the time the pipeline received it. Same name, same type, same format. What moved is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The change was made for a good reason. Producers were sending clock-skewed event times, some of them from user devices, and 3% of events arrived dated in the future. Stamping at ingest gives a monotonic, trustworthy value that nothing upstream can corrupt, and the team that did it wrote a design note.

Ingest time and event time are the same number whenever the pipeline is keeping up. They diverge exactly when it is not. So the field agrees with its old meaning on every ordinary day, and stops agreeing precisely on the days anybody looks at it closely.

Both quantities are carried, per hour of one backlog day.

```
hour   events   pipeline lag   events stamped into a later hour
  09     41000    0 min        0
  10     44000    0 min        0
  11     46000    4 min        3000
  12     52000    31 min        26000
  13     58000    74 min        58000
  14     55000    92 min        55000
  15     47000    40 min        31000
  16     43000    6 min        4000
```

```
events that day        : 386000
stamped into the wrong hour : 177000, 45%
```

```
hours in which the two meanings coincide
  lag zero : 2 of 8
  on those hours the field is identical under either definition
  on the other 6 it is not, and those are the hours with a backlog
```

```
the hourly volume chart, both ways
hour   by event time   by ingest time   difference
  09     41000         41000        0
  10     44000         44000        0
  11     46000         43000        -3000
  12     52000         29000        -23000
  13     58000         26000        -32000
  14     55000         58000        3000
  15     47000         71000        24000
  16     43000         70000        27000
  the chart is smooth under both definitions and it is a different chart
```

```
an alert fires when an hour exceeds 50000 events
  hours over the bar by event time  : 3
  hours over the bar by ingest time : 3
  same data, same threshold, same field name
```

```
records are deleted 90 days after occurred_at
  under event time  : 90 days after the thing happened
  under ingest time : 90 days after we received it
  for an event delayed 74 minutes the difference is negligible
  for a replayed backfill the difference is the age of the backfill
  so a re-ingest of two-year-old data resets its deletion clock, and the
  retention rule has no way to notice
```

```
the problem it solved
  events dated in the future : 3% before, 0 after
  clock skew from user devices : no longer reaches any consumer
  monotonic ordering : guaranteed, which it was not before
  all three of those are real and none of them came back
```

```
what a consumer would need to notice
  field name change : none
  type change       : none
  new field carrying the old meaning : not added
  design note : written, and read by the two people in the review
  consumers of this field : 11
```

```
carrying both stamps
  occurred_at : event time, as the name says, skew and all
  ingested_at : pipeline time, monotonic and trustworthy
  bytes added per record : 8
  bytes a day : 3088000
  consumers that would then be choosing rather than inheriting : 11
  the skew problem is solved by which field the ordering uses, not by
  redefining the one that was already named after the other thing
```

```
control - the same change shipped as a new field received_at
  consumers : 11
  consumers that had to make a choice : 11
  consumers that silently changed behaviour : 0
  the identical semantic change, and the rename is what converts a
  silent shift into a decision somebody makes
```

Stamping at ingest removed real clock skew and 3% future-dated events. The two meanings agree whenever the pipeline keeps up, so the field only disagrees with its own name on the 6 hours anybody would investigate.

Verify it yourself:

```bash
pnpm eml run examples/the-timestamp-changed-from-event-time-to-ingest-time/the_timestamp_changed_from_event_time_to_ingest_time.eml
```
