# The count is of tickets, not of incidents - reports fell 54% and events did not move

`the_count_is_of_tickets_not_of_incidents.eml` builds both quarters from the same underlying events so the two counts can be separated.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: counting tickets is the only thing a ticket system can do, and it is the right count for what it was built for. The number of tickets an event produces depends on how many people notice it and whether they check for an existing one first - and a search box before the file button changes that ratio and nothing else.

```
underlying events : 8 in both quarters
```

```
tickets
  Q1 : 24
  Q2 : 11
  change : 54% fewer
```

```
events
  Q1 : 8
  Q2 : 8
  change : 0%
```

```
tickets per event
  Q1 : 30
  Q2 : 13
  (in tenths)
```

```
per event
  e1 : 4 -> 1
  e2 : 3 -> 1
  e3 : 2 -> 1
  e4 : 5 -> 2
  e5 : 1 -> 1
  e6 : 3 -> 2
  e7 : 2 -> 1
  e8 : 4 -> 2
  events that still produced at least one ticket : 8 of 8
  every event is still visible - nothing was hidden, only deduplicated
```

```
the two readings of the same drop
  'we fixed 54% of our problems'
  'the same problems now produce fewer duplicate tickets'
  events that stopped happening : 0
```

```
what would tell the two apart
  ticket count       : same under both stories
  distinct events    : 8 - unchanged, and this is the discriminating number
  and it exists only if tickets are linked to an event
```

```
control - a quarter where the ratio held and events actually fell
  tickets : 10 -> 6  (40% fewer)
  events  : 5 -> 3  (40% fewer)
  here the ticket count tracks the events exactly
```

Every ticket is real and the count is correct. It counts reports, and the number of reports an event produces is a property of how people file, not of how often the event happens.

The **control** is a quarter where the ratio held still and events genuinely fell: there the ticket count tracks the events exactly, 40% against 40%.

Verify it yourself:

```bash
pnpm eml run examples/the-count-is-of-tickets-not-of-incidents/the_count_is_of_tickets_not_of_incidents.eml
```
