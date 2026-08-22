# The environment was booked by whoever booked first

`the_environment_was_booked_by_whoever_booked_first.eml` - One staging environment, booked first-come. Who gets it and who needs it are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: First-come is the right default for a shared resource. It needs no judge, it cannot be gamed by arguing, everybody understands it, and any scheme that ranks bookings by importance needs somebody to rank them and somebody to appeal to. Nobody was treated unfairly by the calendar.

First-come ranks by when you look at the calendar. That is a fact about working hours, planning habits and how far ahead a team knows its schedule, and none of those is how much the booking is worth.

Bookings and blocked work are counted per team.

```
teams : 6
bookings this quarter : 36, hours : 144
```

```
team           bookings   hours   plans ahead   value of the work
  release eng   14         56      10 days       3
  platform   11         44      8 days       4
  payments   3         12      2 days       9
  mobile   2         8      1 days       8
  data   5         20      5 days       5
  security   1         4      1 days       10
```

```
hours held, by planning horizon
  teams that plan 5+ days ahead : 120 hours
  teams that plan under 5 days  : 24 hours
  the long-horizon teams hold 83% of the environment
```

```
hours held, by the value of the work
  teams whose work scores 7 or above : 3 team(s), 24 hours
  teams below 7                      : 3 team(s), 120 hours
  the lower-value work holds 83% of the hours
```

```
what predicts hours held
  planning horizon : long horizon, more hours
  value of the work: no relationship visible in this quarter
  a team that knows next week's schedule books next week; a team responding
  to something books today, and today is taken
```

```
why the short-horizon teams are short-horizon
  payments : 2 day(s), work value 9
  mobile : 1 day(s), work value 8
  security : 1 day(s), work value 10
  security and incident-driven work cannot be scheduled ten days out, and
  that is a property of the work rather than of the team
```

```
holding back 8 hours a quarter for same-week booking
  hours removed from open booking : 8 of 144
  which is 5%
  teams it would serve : 3
  first-come still applies inside the reserved block, so no judge is added
  and nobody has to rank anybody
```

```
control - a second environment with spare capacity
  bookings refused : 0
  hours contended  : 0
  first-come and any other scheme give the same result here, so the policy
  is only doing work when the thing is scarce
```

First-come needs no judge and cannot be argued with, which is why it is the right default. It orders by when a team looks at the calendar, and the teams that cannot look early are the ones whose work arrives without warning.

Verify it yourself:

```bash
pnpm eml run examples/the-environment-was-booked-by-whoever-booked-first/the_environment_was_booked_by_whoever_booked_first.eml
```
