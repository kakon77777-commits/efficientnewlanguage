# The error budget was monthly and the outage was not

`the_error_budget_was_monthly_and_the_outage_was_not.eml` - Two months consume the same error budget to the tenth of a minute. What each one did to users is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A monthly error budget is the right instrument and it was chosen over the alternatives deliberately. It converts an availability target into a quantity that can be spent, which lets a team trade risk against velocity without arguing about it each time; it is comparable across services; and it cannot be gamed by moving a threshold, because the threshold IS the target.

A budget is an integral. It sums unavailable time and discards when that time occurred, how it was distributed, and how many distinct people met it. Two very different months integrate to the same number.

Both months below stay inside the budget. Neither triggers anything.

```
minutes in the month     : 43200
availability target      : 999 per thousand
error budget             : 43 point 2 minutes
active users at any time : 12000
```

```
month A - one incident
  incidents           : 1
  downtime            : 42 point 0 minutes
  budget consumed     : 972 per thousand
```

```
month B - one incident a day
  incidents           : 30
  each lasting        : 1 point 4 minutes
  downtime            : 42 point 0 minutes
  budget consumed     : 972 per thousand
```

```
  difference in budget consumed : 0 tenths of a minute
```

```
sessions interrupted
  month A : 12000 - everyone active during the one window
  month B : 126000 - 4200 a day for 30 days
  ratio   : 10 point 5 times month A
```

```
a user who is active every day
  interruptions in month A : 1, at most
  interruptions in month B : about 10
  and the budget cannot express the difference, because it
  sums minutes and a person is not a minute
```

```
metric                     month A        month B
  downtime, minutes        42 point 0           42 point 0
  budget consumed          972 per mille    972 per mille
  budget exceeded          no             no
  alerts fired             1              30
  sessions interrupted     12000          126000
```

```
  the first four rows are what the SLO reports
  the fifth is not one of them
```

```
control - is the error budget correct
  target                     : 999 per thousand
  budget, recomputed         : 43 point 2 minutes
  month A within budget      : yes
  month B within budget      : yes
  months misclassified       : 0
  defects in the budget      : 0
```

```
  every minute of downtime is in those totals exactly once
```

```
null control - two months of the same shape
  month C : 1 incident, 21 point 6 minutes
  month A : 1 incident, 42 point 0 minutes
  budget consumed : 500 vs 972 per mille
  sessions        : 6000 vs 12000
  the budget and the users agree on the ordering
  the statistic did not improve; the two months became comparable
```

```
what a budget over a window measures
  total unavailable time : exactly, and that is its definition
  how it was distributed : discarded by the summation
  how many people met it : never entered the arithmetic
```

```
the missing number is not a tighter target, which would fail
both months together; it is a second budget with a different
denominator - distinct users interrupted, or incidents - so
that a shape the sum cannot see has somewhere to show
```

Both months consume 972 per thousand of a 43 point 2 minute budget, differ by 0 tenths of a minute, and neither exceeds anything. Month A interrupts 12000 sessions once; month B interrupts 126000 - 10 point 5 times - and a daily user meets it about 10 times, which is a fact about people that a sum of minutes has no term for.

Verify it yourself:

```bash
pnpm eml run examples/the-error-budget-was-monthly-and-the-outage-was-not/the_error_budget_was_monthly_and_the_outage_was_not.eml
```
