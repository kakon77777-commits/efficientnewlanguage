# The escalation bought time that was not spare

`the_escalation_bought_time_that_was_not_spare.eml` - Seven requests were escalated this quarter and all seven were served first. Where the time came from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Serving an escalation first is right. Somebody senior has looked at it and judged it urgent, the requester has spent their own credibility on it, and a team that ignores escalations is a team that has to be escalated past. The mechanism works because it is honoured.

The engineering week does not grow when something is escalated. Serving one thing first is deferring everything behind it, and what gets deferred is whatever had no escalation - which is not the same as whatever mattered least.

Both sides of the ledger are computed.

```
items in the quarter : 12
  escalated : 7, 29 days of work
  queued    : 5, 20 days of work
```

```
item   days   escalated   value   days delayed
  e1     3      yes         4       0
  e2     5      yes         3       0
  e3     2      yes         7       0
  e4     8      yes         2       0
  e5     4      yes         5       0
  e6     1      yes         6       0
  e7     6      yes         3       0
  q1     4      no          9       29
  q2     3      no          8       29
  q3     6      no          9       29
  q4     2      no          6       29
  q5     5      no          7       29
```

```
mean value of the escalated items : 42 tenths
mean value of the queued items    : 78 tenths
  the queued items are the more valuable group
  escalation is a claim about urgency and it is being used to order by
  something that is not value
```

```
value-days lost to delay : 1131
  (days delayed times the value of what was delayed)
  worst single item : q1, 261 value-days
```

```
what escalating requires
  knowing the escalation path exists : yes
  having a senior sponsor            : yes
  being willing to spend the credit  : yes
  none of the three is the value of the work, and all three are properties
  of the requester rather than the request
```

```
the delivery record, as it reads at the end of the quarter
  escalations served on time : 7 of 7, 100%
  queued items delivered     : 0 of 5
  the first line is what gets reported and it is true
```

```
the same 29 days, ordered by value
  items shipped : 0
  value shipped : 0
```

```
control - a quarter where the escalated items are the valuable ones
  mean value escalated : 85 tenths, queued : 30 tenths
  the escalations are the more valuable group, so serving them first is
  both responsive and correct, and nothing has to be traded
```

Honouring escalations is what keeps the mechanism working and every one of these was judged urgent by somebody senior. The week did not grow, so the order was decided by who had a sponsor.

Verify it yourself:

```bash
pnpm eml run examples/the-escalation-bought-time-that-was-not-spare/the_escalation_bought_time_that_was_not_spare.eml
```
