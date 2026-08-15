# The decision was made before the number arrived - 1 distinct decision across 8 possible results, 4 distinct announcements

`the_decision_was_made_before_the_number_arrived.eml` runs the decision over every possible result and counts the distinct decisions, because that - not whether it was read - is the test of whether an analysis mattered.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nothing here is a sham. The number is computed correctly, the analyst has no thumb on the scale, and the meeting genuinely discusses it. What has already happened is that the contract is signed, the team is hired and the date is announced, so the set of outcomes leading to not shipping is empty before the first data point exists.

```
possible results : 8
```

```
result   decision as committed   decision as planned
  -40       ship                   do not ship
  -20       ship                   do not ship
  -5       ship                   do not ship
  0       ship                   do not ship
  5       ship                   ship
  20       ship                   ship
  40       ship                   ship
  80       ship                   ship
```

```
distinct decisions the analysis can produce
  as committed : 1
  as planned   : 2
  one decision over every possible result - the analysis has no path to
  the outcome, whatever it says
```

```
what the number did change
  distinct announcements : 4
    early, with the gains still ahead
    neutral, as expected at this stage
    a modest but real gain
    a clear win
```

```
  decisions the number can change : 1
  announcements it can change     : 4
  the number is doing work, and the work is not the work it was for
```

```
timeline
  week 1 : contract signed
  week 2 : team hired
  week 3 : date announced
  week 4 : analysis requested
  week 7 : result available
  week 8 : decision meeting
  weeks between commitment and result : 4
```

```
control - the same possible results, decided before anything was committed
  distinct decisions : 2
  two outcomes, so the analysis can decide something
```

An analysis that is read, discussed and correct can still have no path to the outcome. Whether it had one is a question about the calendar, not about the analysis.

It is not that nothing depended on the number: the **announcement** depended on it, four ways. That is a real use - just not the use the plan named.

Verify it yourself:

```bash
pnpm eml run examples/the-decision-was-made-before-the-number-arrived/the_decision_was_made_before_the_number_arrived.eml
```
