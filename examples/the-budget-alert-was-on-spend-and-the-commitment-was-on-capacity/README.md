# The budget alert was on spend and the commitment was on capacity

`the_budget_alert_was_on_spend_and_the_commitment_was_on_capacity.eml` - Budget alerts are configured at two thresholds, tested with a real charge, and routed to a person who acknowledges them. What they can move with is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The alerting is set up properly. There are two thresholds rather than one, so there is a warning before the wall; the configuration was tested by pushing a synthetic charge through and watching the alert arrive, rather than trusting the console; it is routed to a named person rather than a distribution list; and that person acknowledges. Nobody here was careless.

The alert fires on SPEND. The account is on a three-year committed-use agreement, so the invoice is the commitment whether the capacity is used or not, and spend is constant by construction.

Utilisation went from eighty-two percent to thirty-one after a migration.

```
alert thresholds configured     : 2
synthetic charge tests          : 1
named people who acknowledge    : 1
alerts that fired               : 0
```

```
commitment months               : 36
monthly commitment, dollars     : 420000
month over month spend variance : 0
```

```
utilisation before, percent     : 82
utilisation after, percent      : 31
  points lost                   : 51
  unused after, percent         : 69
```

```
monthly dollars for unused capacity : 289800
months since the migration          : 7
  dollars since                     : 2028600
alerts configured on utilisation    : 0
```

```
the budget alerts
  thresholds : 2, so there is a warning before the
    wall rather than only a wall
  tested by : pushing a synthetic charge and watching it
    arrive, not by reading the console
  routed to : a named person, not a list
  acknowledged : yes
  verdict : CONFIGURED AND WORKING
```

```
  testing the alert with a real charge is the step that
  separates this from a checkbox, and it was done
```

```
the monitored quantity
  what fires the alert : spend crossing a threshold
  what determines spend : the commitment, for 36
    months
  what changes when capacity goes unused : nothing on the
    invoice
  month over month variance : 0
  so the number the alert watches : cannot move
```

```
  the alert is correctly wired to a quantity that this
  contract holds constant
```

```
the commitment
  taken deliberately : yes, against on-demand pricing
  did it save money at the time : yes
  is it the mistake : no
  what it does to spend : fixes it for 36 months
  what it does to the alert : leaves it correctly wired
    to a constant
```

```
the migration
  moved the workload to : something that suits it better
  was that right : yes, on its own terms
  capacity needed after : lower
  capacity bought after : the same
  utilisation, before and after : 82 and 31
  what appeared on the invoice : nothing
```

```
utilisation
  is it measured : yes, the provider reports it
  is it on a dashboard : yes
  alerts configured on it : 0
  what it would have shown : 51 points, in one month
  what nobody was watching for : a number going down
  dollars behind those points, so far : 2028600
```

```
null control - a threshold on utilisation too
  spend thresholds : 2, unchanged
  utilisation thresholds : 2
  alerts that fire in the migration month : 1
  the alerting did not get better; it acquired a threshold
  on a quantity this contract lets move
```

```
what a working budget alert guarantees
  spend crossing a threshold is noticed : exactly, tested
    with a real charge and acknowledged by a person
  waste is noticed : not addressed; the alert is
    denominated in spend, and this contract decouples
    spend from consumption
```

```
an alert can only report on a quantity that varies; a
contract that fixes the monitored quantity does not break
the alert, it removes the alert's subject, and a silent
alert is what correct configuration looks like
```

The alerting is done properly: 2 thresholds rather than one, tested by pushing a real charge through, routed to 1 named person who acknowledges. It fires on spend, which a 36-month commitment holds at 0 variance, so utilisation falling from 82 to 31 percent produced 0 alerts while 289800 dollars a month bought nothing - 2028600 over 7 months.

Verify it yourself:

```bash
pnpm eml run examples/the-budget-alert-was-on-spend-and-the-commitment-was-on-capacity/the_budget_alert_was_on_spend_and_the_commitment_was_on_capacity.eml
```
