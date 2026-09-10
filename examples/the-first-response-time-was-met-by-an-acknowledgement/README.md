# The first response time was met by an acknowledgement

`the_first_response_time_was_met_by_an_acknowledgement.eml` - Every ticket gets a first response within fifteen minutes, and the target has been met every month for fourteen months. What counts as a response is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is honest. The clock starts when the customer sends, not when the ticket is triaged; it runs in the customer's own time zone; tickets that arrive out of hours are measured against the out-of-hours target rather than excluded; and the number is computed from the message log rather than from a field anybody can edit.

A response is a message on the ticket. An automatic acknowledgement is a message on the ticket.

```
tickets a month                 : 24000
first response target, minutes  : 15
  tickets meeting it            : 23640
  missing it                    : 360
  met                           : 9850 per ten thousand
months the target has been met  : 14
```

```
first response was automatic    : 21100
  a person answered first       : 2900
  answered by a machine         : 8791 per ten thousand
median minutes to the acknowledgement : 1
median minutes to a person      : 190
  past the target by            : 175 minutes
dashboards showing time to a person : 0
```

```
resolution target, hours        : 24
  tickets meeting it            : 17800
  met                           : 7416 per ten thousand
```

```
the first-response measurement
  the clock starts : when the customer sends, not when
    the ticket is triaged
  the time zone : the customer's
  out of hours : measured against the out-of-hours
    target, not excluded
  the source : the message log, not an editable field
  months met : 14
  verdict : RESPONSIVE
```

```
  computing it from the message log rather than a field
  is the part almost nobody does, and it is why the 
  9850 per ten thousand cannot be typed in
```

```
what the target asks for
  the predicate : a message on the ticket within 
    15 minutes
  the cheapest thing that satisfies it : an automatic
    acknowledgement, median 1 minute
  tickets where that is what happened : 
    21100
  median minutes until a person writes : 
    190
  so the target is met by 175 minutes before
    anybody reads the ticket
```

```
  a predicate a machine can satisfy will be satisfied by
  a machine, and that is not a failure of the machine
```

```
a ticket that met the target
  minute 1 : an acknowledgement, and the target is met
  minute 190 : a person, at the median
  what the dashboard showed at minute 2 : green
  what it showed at minute 100 : green
  dashboards that would have shown otherwise : 
    0
  resolution within 24 hours : 7416 per ten
    thousand, which is the number nobody quotes
```

```
null control - stop the clock at the first person
  tickets measured : 24000, unchanged
  months measured : 14, unchanged
  meeting 15 minutes to a person : 
    2900
  nobody answered any slower; the predicate stopped being
  satisfiable without them
```

```
what a met first-response target guarantees
  every ticket received a message within 
    15 minutes : exactly, from the message log,
    in the customer's time zone, 14 months
  every customer heard from somebody : not addressed;
    21100 of 24000 first responses were sent by a rule
```

```
a target names a predicate, and a population under a
target moves to the cheapest thing that satisfies it; what
the predicate stood for is the quantity nothing now
measures
```

The clock starts when the customer sends, runs in their time zone, includes out-of-hours tickets and is computed from the message log - 9850 per ten thousand met, 14 months running. A message satisfies it, so 21100 of 24000 were answered first by a rule at 1 minute while a person takes 190 - 175 minutes past the target - across 0 dashboards that show it.

Verify it yourself:

```bash
pnpm eml run examples/the-first-response-time-was-met-by-an-acknowledgement/the_first_response_time_was_met_by_an_acknowledgement.eml
```
