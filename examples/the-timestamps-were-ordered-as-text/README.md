# The timestamps were ordered as text

`the_timestamps_were_ordered_as_text.eml` - The audit log is ordered by timestamp and the sort is correct. What kind of order it is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The ordering is careful. It sorts on the real timestamp field, not the row insertion order; it uses the database's own sort; it covers every event; and ordering the log by time is exactly what the investigator needs to read cause before effect.

The timestamp is stored as text, and text order equals time order only while every timestamp has the same shape.

```
events in the log               : 600000
  timestamp ends in Z (UTC)     : 590000
  timestamp ends in +02:00      : 10000
total (check)                   : 600000
events out of true-time order   : 0
differently-shaped share        : 166 per ten thousand
```

```
the log ordering
  sorts on : the real timestamp field, not insertion order
  operator : the database's own sort
  covers : every event
  intent : time order, so cause reads before effect
  events omitted : 0
  verdict : ORDERED BY TIMESTAMP
```

```
  sorting on the timestamp rather than insertion order is
  the part done right here, and it is why a delayed insert
  does not misplace an event by arrival
```

```
sorting timestamps as text
  when it equals time order : while every string has the
    same shape and zone
  the two shapes present : '...T10:00:00Z' and
    '...T11:30:00+02:00'
  the +02:00 event's true instant : 09:30 UTC, earlier
    than the Z event's 10:00
  text order : puts '11:30:00+02:00' after '10:00:00Z',
    by the leading digits
  so text order and instant order : disagree once zones
    differ
```

```
the log as ordered
  an effect at 09:30 UTC written +02:00 : sorts after its
    cause at 10:00 UTC written Z
  so effect appears : after cause, though it happened
    before
  is the sort wrong : no; it is the correct text order
  is text order the instant order : only while all zones
    and widths match
  events with the differing shape : 
    10000
```

```
null control - normalize to UTC before ordering
  text order equals instant order : 
    0
  instant order is correct : 1
  events that move to their true place : 
    10000
  no event changed; the order stopped being taken over the
  characters and started being taken over the instants
```

```
what ORDER BY timestamp guarantees
  the rows are in ascending order of the stored string :
    exactly, the engine's own sort over every event
  the rows are in time order : not addressed; the
    timestamp is text and the events carry two zone shapes,
    so a +02:00 event at 09:30 UTC sorts after a Z event at
    10:00 UTC - cause and effect swap for the 
    10000 differently-shaped rows
```

```
a timestamp is an instant, but stored as text it sorts as characters, and
characters order by shape before meaning; two encodings of the same instant
compare by their digits, not their moment
```

It sorts the real timestamp field with the engine's sort over every event - a correct text order. The timestamps carry two zone shapes, so a +02:00 event sorts after an earlier Z event by its leading digits, swapping cause and effect for 10000 rows, 166 per ten thousand of the log.

Verify it yourself:

```bash
pnpm eml run examples/the-timestamps-were-ordered-as-text/the_timestamps_were_ordered_as_text.eml
```
