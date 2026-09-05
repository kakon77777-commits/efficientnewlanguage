# The quota was checked at submit and spent at run

`the_quota_was_checked_at_submit_and_spent_at_run.eml` - Every job is checked against its tenant's remaining budget before it is accepted, and no submission has bypassed the check. What the check compares is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The admission check is real enforcement, not advice. It runs in the submit path, it refuses rather than warns, there is no flag to skip it, and it has turned away nine thousand four hundred submissions this month. A tenant cannot submit a job whose declared cost exceeds what is left.

The check reads the budget remaining, which is the quota minus what completed jobs have spent. A job that was accepted and has not run yet has spent nothing, so it appears in neither term, and it is going to run.

The median job waits forty-one minutes in the queue before it starts.

```
submissions per month           : 340000
  refused at submit             : 9400
  share refused                 : 276 per ten thousand
  that bypassed the check       : 0
```

```
median queue wait, minutes      : 41
accepted and not yet started, per tenant : 24
reservations taken at submit    : 0
```

```
tenants                         : 1900
  within quota                  : 1690
  spend exceeded quota          : 210
  share                         : 1105 per ten thousand
```

```
the admission check
  where it runs : the submit path
  on insufficient budget : refuses, does not warn
  a flag to skip it : none
  submissions refused this month : 9400
  submissions that bypassed it   : 0
  verdict : ENFORCED
```

```
  refusing rather than warning is what makes this a limit,
  and it is enforced without exception
```

```
the comparison
  left  : the declared cost of this job
  right : quota minus what completed jobs have spent
  jobs accepted and not yet run : counted in neither term
  how many of those a tenant typically has : 24
  reservations that would put them in the right operand : 
    0
```

```
  the check is correct about one job against a number, and
  the number omits the jobs the same check already accepted
```

```
one tenant near the limit
  jobs submitted while near the limit : each passes
  each check compares against : the budget at that instant
  each of those checks is correct : yes
  jobs queued and approved     : 24
  what they collectively cost  : more than what is left
  the moment the aggregate is evaluated : never; there is
    no step that sums the approved queue
```

```
submit and run
  what happens at submit : the check, and acceptance
  what happens at run    : the spend
  minutes between them, median : 41
  what changes in between : other jobs of the same tenant
    start and finish
  what the check knew about them : nothing; they had not
    spent yet either
```

```
null control - a reservation is taken at submit
  submissions checked : 340000, unchanged
  queued jobs visible to the check : 24
  tenants exceeding quota : 0
  the check did not become stricter; the number it reads
  started including the commitments the check itself made
```

```
what an enforced admission check guarantees
  no accepted job exceeded the budget at its own submit :
    exactly, with no exception and no bypass
  accepted jobs will not exceed the budget              : not
    addressed; that is a property of a set, and the check
    is a predicate on one element against a stale total
```

```
a limit enforced per request bounds each request; bounding
the sum requires the accounting to move at the moment of the
decision rather than at the moment of the cost
```

The check is real enforcement: it runs in the submit path, refuses rather than warns, has no bypass, and turned away 9400 of 340000 submissions - 276 per ten thousand. It compares one job against quota minus completed spend, and a tenant holds 24 approved jobs waiting a median of 41 minutes with 0 reservations against them, so 210 of 1900 tenants - 1105 per ten thousand - spent past a quota no single submission was ever allowed to exceed.

Verify it yourself:

```bash
pnpm eml run examples/the-quota-was-checked-at-submit-and-spent-at-run/the_quota_was_checked_at_submit_and_spent_at_run.eml
```
