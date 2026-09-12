# The day boundary was the servers and the user was elsewhere

`the_day_boundary_was_the_servers_and_the_user_was_elsewhere.eml` - The daily active count is computed correctly every day, and no event is counted twice. What defines the day it lands in is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The counting is careful. Each event is counted once; the boundaries are exactly 24 hours apart; the query is inclusive at the start and exclusive at the end, so no event falls in two days or none; and the total across days equals the total events.

The day boundary is the server's midnight, and the users are nine hours ahead.

```
events counted today (server)   : 48000
  double counted                : 0
users' hours ahead              : 9
```

```
of today's count, truly the user's today : 42800
in the user's next day already  : 5200
  misassigned                   : 1083 per ten thousand
total events (either framing)   : 48000
```

```
the daily count
  each event : counted once
  boundaries : exactly 24 hours apart
  the window : inclusive start, exclusive end
  total across days : equals total events
  events double counted or dropped : 0
  verdict : COUNTED CLEANLY
```

```
  an inclusive-start exclusive-end window is the part
  done right here, and it is why no event lands in two
  days or in none
```

```
the boundary the count uses
  which midnight : the server's
  where the users are : nine hours ahead
  so a user's late evening : is already the next day for
    them while it is still today on the server
  events in that window : 5200
  what moved them : not a miscount, a different midnight
```

```
the day as the user lived it
  events the server calls today : 48000
  events the user calls today : 
    42800
  the difference : 5200, pushed a day forward
  is any event lost : no; the total is the same either
    way
  is any event in the right day : only if the user keeps
    the server's clock
```

```
null control - bucket by the user's local midnight
  server-framed today : 48000, unchanged in size
  user-framed today : 42800
  events that move to another day : 5200
  no event was added or dropped; the boundary moved from
  the server's clock to the user's
```

```
what a clean daily count guarantees
  each event is counted once in exactly one day : exactly,
    24-hour boundaries, half-open window, totals reconcile
  each event is in the day it happened : not addressed;
    the boundary is server midnight and the users are nine
    hours ahead, so 5200 of their late-evening events land
    in the next server day
```

```
a count is clean when its buckets partition the events, and a day is a bucket
defined by a midnight; whose midnight is a choice, and the wrong one puts an
event in a real bucket that is not its own
```

Each event is counted once in a half-open 24-hour window, totals reconcile - no miscount. The boundary is the server's midnight and the users are 9 hours ahead, so 5200 late-evening events sit in the wrong calendar day, 1083 per ten thousand, with 0 actually lost.

Verify it yourself:

```bash
pnpm eml run examples/the-day-boundary-was-the-servers-and-the-user-was-elsewhere/the_day_boundary_was_the_servers_and_the_user_was_elsewhere.eml
```
