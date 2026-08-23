# The log level was set by the writer

`the_log_level_was_set_by_the_writer.eml` - Each service team sets its own log level. The bill arrives at a team that cannot change any of them. Both quantities are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Every one of these levels was set for a reason. DEBUG went on during an incident and stayed on because the incident class is not closed. The team that turned it on can point at three bugs they found with it, and they are right that turning it off would have cost them those three bugs.

Log volume is decided in a service's own configuration and paid out of a shared retention budget. The team choosing the level sees the diagnosis it buys. The team paying sees a total, with no line item that any single decision would move by much.

Both ends are counted below.

```
services            : 5
retention           : 30 days
stored right now    : 3634 GB
```

```
service      level   lines/day     bytes/line   GB stored   requests/day
  payments   DEBUG   240000000   380        2548      900000
  catalog   INFO   9000000   240        60      4000000
  notifier   DEBUG   88000000   410        1008      120000
  auth   WARN   400000   260        2      6000000
  reporting   INFO   2000000   300        16      40000
```

```
lines written per 1000 requests, a unit fine enough that the quietest
service does not floor to zero
  payments : 266666 lines per 1000 requests
  catalog : 2250 lines per 1000 requests
  notifier : 733333 lines per 1000 requests
  auth : 66 lines per 1000 requests
  reporting : 50000 lines per 1000 requests
  loudest : notifier at 733333 lines per 1000 requests
  its traffic : 120000 requests a day
  busiest service : auth at 6000000 requests a day
  the loudest service is not the busiest one, so volume here is a
  configuration choice rather than a consequence of traffic
```

```
share of the stored bytes, by the team that set the level
  payments : 2548 GB, 70%
  catalog : 60 GB, 1%
  growth : 1008 GB, 27%
  identity : 2 GB, 0%
  data : 16 GB, 0%
  the retention bill is paid by : platform
  bytes platform itself wrote : 0 GB
  levels platform can change  : 0
```

```
what the DEBUG output bought
  payments : 3 bugs found, logs queried 6 times a month
  notifier : 1 bugs found, logs queried 0 times a month
  notifier stores 1008 GB that nobody has queried
  services at DEBUG whose logs are never read : 1 of 2
  finding three bugs is a real return, and it is not the same fact as
  whether the volume is still being used
```

```
the same levels at 7 days of retention
  stored : 3634 GB -> 846 GB
  reduction : 76%
  levels changed : 0
  this is the only lever the paying team actually holds, and it is the one
  that does not distinguish between the useful lines and the rest
```

```
the same bill, split to the team that set the level
  payments : 2548 GB
  catalog : 60 GB
  growth : 1008 GB
  identity : 2 GB
  data : 16 GB
  under a shared budget every team's incentive is to log more, because the
  diagnosis is theirs and the storage is everyone's
  under a split budget the same DEBUG decision is still available, and it
  is made by someone who can see what it costs
```

```
control - auth at WARN, level set by identity, billed to identity
  stored : 2 GB
  services here busier than it : 0 of 5
  lines per 1000 requests : 66, with 0 services below it
  so it is the busiest service here and the quietest writer
  nothing stops it going to DEBUG, and the team that would do it is the
  team that would see the number move
```

Every level here was set for a reason and DEBUG really did find those bugs. A log level is chosen in one team's configuration and paid out of another team's budget, and only one of those two can see both numbers.

Verify it yourself:

```bash
pnpm eml run examples/the-log-level-was-set-by-the-writer/the_log_level_was_set_by_the_writer.eml
```
