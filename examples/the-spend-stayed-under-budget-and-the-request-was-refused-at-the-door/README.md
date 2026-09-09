# The spend stayed under budget and the request was refused at the door

`the_spend_stayed_under_budget_and_the_request_was_refused_at_the_door.eml` - The research cluster has not exceeded its monthly budget once in three years, and the control that holds it there is a real one. How it holds is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The control is admission. A job carries an estimated cost, the estimate is checked against what the team has left, and a job that would take the team past it is refused at submission rather than killed halfway through. Nothing is reclaimed retroactively, no run is lost to a mid-flight cancellation, and the estimate is calibrated against measured cost every month.

So the spend cannot exceed the budget. The quantity that can vary is what was turned away.

```
monthly budget, core hours      : 480000
  spent last month              : 471200
  headroom                      : 8800
  budget used                   : 9816 per ten thousand
months never over budget        : 36
```

```
jobs submitted a month          : 15400
  refused at admission          : 1870
  refused share                 : 1214 per ten thousand
  resubmitted smaller           : 1290
  never seen again              : 580
```

```
core hours inside refused jobs  : 96300
  against the budget            : 2006 per ten thousand
teams on the cluster            : 74
  that reached the gate         : 41
  that never reached it         : 33
reports carrying refused hours  : 0
```

```
the admission control
  when it acts : at submission, against the team's
    remaining budget
  what it does not do : kill a run halfway or reclaim
    hours after the fact
  the estimate : calibrated against measured cost every
    month, so a refusal is not guesswork
  months without an overspend : 36
  verdict : WITHIN BUDGET
```

```
  refusing at the door rather than killing mid-flight is
  the part almost nobody does, and it is why the 36
  months cost nobody a lost run
```

```
what could put spend above budget
  a job admitted that takes the team past it : refused
  a job that grows past its estimate : the estimate is
    calibrated, and overruns are charged to the next
    month
  so the only path to an overspend : admitting one
  admissions of that kind : none, by construction
  budget used : 9816 per ten thousand, and it could not
    have been more
```

```
  a number that is prevented from rising is not evidence
  that it would have
```

```
a job that was turned away
  did it run : no
  did it appear in the spend : no
  did it appear in the overspend count : no; there was
    no overspend
  was it resubmitted smaller : 1290 were
  and the rest : 580 were not
  hours behind them : 96300, or 2006 per ten
    thousand of a monthly budget
```

```
null control - report the refused hours beside the spent
  months never over budget : 36, unchanged
  core hours spent : 471200, unchanged
  core hours reported as refused : 96300
  the control did not change and neither did the spend;
  the quantity that was free to vary was written down
```

```
what three years under budget guarantees
  spend did not exceed the budget : exactly, and it
    could not have, 36 months running
  the budget was enough : not addressed; the demand that
    would have shown otherwise was refused before it
    could be spent
```

```
a limit that is enforced by refusing the excess reports
only its own enforcement; what it cost is in the refusals,
and nothing here puts the two on one page
```

Admission refuses a job at submission rather than killing it mid-flight, the estimate is recalibrated monthly, and 36 months have passed without an overspend. Spend read 9816 per ten thousand of budget and could not have read more, while 1870 jobs a month carrying 96300 core hours were turned away - 2006 per ten thousand of a budget - across 0 reports.

Verify it yourself:

```bash
pnpm eml run examples/the-spend-stayed-under-budget-and-the-request-was-refused-at-the-door/the_spend_stayed_under_budget_and_the_request_was_refused_at_the_door.eml
```
