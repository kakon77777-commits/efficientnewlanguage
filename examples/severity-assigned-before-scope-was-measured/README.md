# Severity assigned before scope was measured — 0 inversions, then 1

`severity_assigned_before_scope_was_measured.eml` runs the same three findings
over two populations and counts how often triage-by-witness ranks them wrongly.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: triage happens when the report arrives and the population
has not been run yet. The only quantity available at that moment is the error in
the one example attached, so that is what gets used — as if it were the size of
the problem.

**This program was written expecting the two orderings to disagree, and on the
first population they agree exactly:**

```
population A  (20 records)
  finding           triaged    witness   affected   total loss
    M1 rounding      MINOR      2   20 of 20   40
    M2 legacy path   CRITICAL   500   1 of 20   500
    M3 large orders  MAJOR      40   10 of 20   400
  pairs where the witness ordering and the impact ordering disagree : 0
```

That result is kept, because it makes the finding narrower and worse. The same
three mechanisms, the same three witnesses, a different customer base:

```
population B  (17 records)
    M1 rounding      MINOR      2   17 of 17   34
    M2 legacy path   CRITICAL   500   1 of 17   500
    M3 large orders  MAJOR      40   15 of 17   600
  pairs where the witness ordering and the impact ordering disagree : 1

pairs that disagree, population B
  M2 legacy path  vs M3 large orders
    witness : 500 vs 40
    impact  : 500 vs 600
```

**The invariant underneath both:**

```
the witness of each finding, in both populations
  M1 rounding     : 2 -> 2
  M2 legacy path  : 500 -> 500
  M3 large orders : 40 -> 40
  witnesses that changed between populations : 0

the impact of each finding, in both populations
  M1 rounding     : 40 -> 34
  M2 legacy path  : 500 -> 500
  M3 large orders : 400 -> 600
  impacts that changed between populations : 2
```

A witness is a property of one record and does not move. An impact is a property
of the population and does. So the claim is not "witness size is a bad proxy" —
it is that **whether it is a good proxy is decided by the population, and the
population is precisely what nobody has when severity is assigned**. The label
will still read `CRITICAL` on the day the customer base has changed underneath
it.

The severity labels are the only stated values in the program — they are what
the triage said, which is data. Every number is measured.

Verify it yourself:

```bash
pnpm eml run examples/severity-assigned-before-scope-was-measured/severity_assigned_before_scope_was_measured.eml
```
