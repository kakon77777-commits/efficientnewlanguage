# Rounding rule drift — why banks use the rule that looks arbitrary

`rounding_rule_drift.eml` rounds every half from 0 to 20 under four tie-breaking
rules and measures the drift each one introduces into the total.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: on any single value the difference between rounding
rules is at most one unit and looks like a detail. Over a column it is not,
because a rule that sends every tie the same way has a bias proportional to the
number of ties.

| rule | drift over 41 values (20 of them ties) |
| --- | --- |
| half-up | **+10** |
| half-even | **0** |
| half-down | −10 |
| truncate | −10 |

The expected drift is **computed, not typed**: with 20 ties, a rule that
resolves them all in one direction must be off by `ties / 2 = 10`. Half-up
matches that exactly and half-even is zero — the entire reason it exists, as a
measurement rather than a claim.

Summing then rounding is not rounding then summing for **3 of the 4** rules.

The check that explains the invisibility: on the 21 values that are **not**
ties, all four rules agree — so a test suite whose fixtures are not exact
halves cannot distinguish them at all.

Everything is exact integer arithmetic on rationals `n/d`, so the measurement
is of the rules and not of floating point.

Verify it yourself:

```bash
pnpm eml run examples/rounding-rule-drift/rounding_rule_drift.eml
```

```bash
pnpm eml trace examples/rounding-rule-drift/rounding_rule_drift.eml --run
```
