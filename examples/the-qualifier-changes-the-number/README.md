# The qualifier changes the number — a 40-point drop and zero change in the service

`the_qualifier_changes_the_number.eml` computes the same uptime figure from one log under a loose rule and a stated one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The loose number was never a lie. It was computed by a real rule over real
data; it just did not say which requests were in the denominator. Writing the
basis down is the fix recommended everywhere, and it has a cost that is rarely
stated: the precise rule and the loose rule do not agree, so publishing the
definition also publishes a drop.


```
the number as published, with no basis stated
  90.0%
```

```
the same log, with the basis written down
  excluding health checks                       : 80.0%
  and counting client-side timeouts as failures : 50.0%
```

```
each clarification, applied alone
  exclude health checks only : 10.0%
  count timeouts only        : 15.0%
  both                       : 40.0%
  the two effects do not add - they overlap on the same requests
```

```
a series where the definition changes at day 4
  day 1 : 90.0%
  day 2 : 90.0%
  day 3 : 90.0%
  day 4 : 50.0%
  day 5 : 50.0%
  day 6 : 50.0%
  the step at day 4 : 40.0%
  real changes in the service : 0
```

```
control - a log containing neither kind of request
  loose   : 75.0%
  precise : 75.0%
  identical, so stating the basis costs nothing here
```

Writing the definition down is the right fix and it is not free. The number
moves, the move looks like news, and the log is the only place that says it
is not.

Verify it yourself:

```bash
pnpm eml run examples/the-qualifier-changes-the-number/the_qualifier_changes_the_number.eml
```
