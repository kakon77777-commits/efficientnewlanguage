# Shift roster: the builder does not get to grade itself

`shift_roster_constraints.eml` builds a weekly roster greedily under four
hard constraints, then audits the finished roster against those same
constraints re-derived from scratch.

**What it exercises**: scheduling is where “the program said it worked”
and “it worked” come apart most often, because the builder and the
validator are usually the same loop. If the assignment step is what
decides a shift is legal, then of course every assignment is legal — the
roster is consistent with whatever rule the builder happened to
implement, including the wrong one.

| constraint | needs |
|---|---|
| at most one worker per shift | per-slot count |
| nobody twice in a day | per-day count |
| at most three shifts a week | per-worker count |
| no night → next-day morning | memory across days |

The last is the one a greedy builder gets wrong first. The audit pass
reads only the finished roster and re-derives all of them.

One shift ends up **uncovered**, and that is not a failure: five workers
with a three-shift cap and real unavailability cannot always cover
fifteen slots. Coverage shortfall and rule violation are counted
separately, and the audit's own count of uncovered slots is compared
against the builder's — conflating the two would have let a genuinely
broken roster pass as “just short-staffed”.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 13 lines)

```
shifts assigned: 14
unfilled:        1
  could not fill: Fri night

uncovered shifts, found by the audit: 1  (builder reported 1)
audit violations:                     0

Every assigned shift is legal, and the audit's coverage count matches the builder's.

An unfilled shift is not a bug here - five workers, a three-shift cap and
real unavailability may genuinely not cover fifteen slots. What would be a
bug is a FILLED shift that breaks a rule, which is why the audit re-derives
every constraint instead of trusting the builder that placed it.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`shift_roster_constraints.trace.jsonl` beside this file is the recorded execution.
