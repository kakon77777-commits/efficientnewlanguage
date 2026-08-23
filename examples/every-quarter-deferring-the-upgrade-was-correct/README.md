# Every quarter deferring the upgrade was correct

`every_quarter_deferring_the_upgrade_was_correct.eml` - A dependency upgrade was deferred eight quarters running. Each deferral is scored under two different rules below, and the accumulated bill is computed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reasons were real. A team that deferred once for a launch, once for an incident backlog, once for a hiring gap and once for a reorg has deferred four times for four good reasons, and nobody here was lazy.

The upgrade's cost is not fixed. It grows with the distance, because each skipped version adds its own breaking changes to the pile. Its value, on the other hand, is realised in a quarter that is not the quarter you pay for it in - the quarter that upgrades ships nothing a user can see.

So the answer depends entirely on which rule is applied. A rule that scores a quarter on what shipped in it never looks at the upgrade's cost at all. A stricter marginal rule - is this quarter's work worth the extra days that waiting one more quarter adds - does look at it, and still says defer for a long time. Both are scored below, against the same eight quarters.

```
quarter   versions behind   upgrade cost   value shipped if deferred
  Q1        1               2 days       5 days (launch)
  Q2        2               3 days       6 days (incident backlog)
  Q3        3               5 days       6 days (hiring gap)
  Q4        5               8 days       7 days (launch)
  Q5        7               12 days       9 days (reorg)
  Q6        9               17 days       8 days (compliance work)
  Q7        12               24 days       9 days (launch)
  Q8        15               34 days       9 days (the bill)
```

```
rule A - score the quarter on value shipped in it
  value an upgrade ships in its own quarter : 0
  quarters where deferring ships more       : 8 of 8
  the rule defers every quarter, and the upgrade's cost never enters
  the comparison at all
```

```
rule B - this quarter's value against the cost that waiting adds
  Q1 : value 5 against 1 days added by waiting -> defer
  Q2 : value 6 against 2 days added by waiting -> defer
  Q3 : value 6 against 3 days added by waiting -> defer
  Q4 : value 7 against 4 days added by waiting -> defer
  Q5 : value 9 against 5 days added by waiting -> defer
  Q6 : value 8 against 7 days added by waiting -> defer
  Q7 : value 9 against 10 days added by waiting -> upgrade
  quarters where deferring is still correct : 6 of 7
  the first quarter the rule says upgrade : Q7
  so under the stricter rule the team was right 6 times running and
  wrong once, at the end
```

```
the upgrade's cost across the deferrals
  at Q1 : 2 days, 1 version behind
  at Q8 : 34 days, 15 versions behind
  multiplied by 17
```

```
cost added per quarter of waiting
  Q2 : 1 days added
  Q3 : 2 days added
  Q4 : 3 days added
  Q5 : 4 days added
  Q6 : 5 days added
  Q7 : 7 days added
  Q8 : 10 days added
  the increments grow, so waiting is not a flat carry
```

```
the people
  decisions to defer : 7
  engineer-decisions behind them : 40
  of those, still on the team when the bill lands : 17
  which is 42%
  the 34 days are paid by a team that made 42% of the calls
```

```
upgrading every quarter within a fixed allowance
  allowance : 2 days a quarter
  total across 8 quarters : 16 days
  against the single bill at Q8 : 34 days
  the steady version is 18 days cheaper in total
  and it never appears on any quarter's list of things that shipped
```

```
control - a dependency whose upgrade cost does not grow with distance
  Q1 : 1 versions behind, 2 days to upgrade
  Q4 : 5 versions behind, 2 days to upgrade
  Q8 : 15 versions behind, 2 days to upgrade
  cost multiplied by 1 across the same span
  here every deferral really was free, and the rule that deferred them was
  measuring the whole cost
```

The reasons were real and the stricter rule agreed with the team for six quarters running. An upgrade's cost lands in the quarter that does it and its value lands everywhere else, so the quarter is the wrong unit to ask.

Verify it yourself:

```bash
pnpm eml run examples/every-quarter-deferring-the-upgrade-was-correct/every_quarter_deferring_the_upgrade_was_correct.eml
```
