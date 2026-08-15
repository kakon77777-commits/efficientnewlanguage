# Fixing the flagged ones moved the threshold - 3 flagged every round, forever

`fixing_the_flagged_ones_moved_the_threshold.eml` runs a relative and an absolute review rule over the same starting population for the same number of rounds.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a relative threshold is the sensible choice for good reasons: an absolute one has to be picked out of the air, goes stale as the system changes, and either floods the queue or empties it. "Review the worst 25%" needs no calibration. It also recomputes itself from a distribution that the reviewing is changing.

```
start : 12 items, total defects 60, worst 9
```

```
policy A - flag the worst 3 each round
  round 1 : flagged 3, total now 47, worst now 6
  round 2 : flagged 3, total now 38, worst now 5
  round 3 : flagged 3, total now 31, worst now 4
  round 4 : flagged 3, total now 25, worst now 3
```

```
policy B - flag anything above 5
  round 1 : flagged 5, total now 41, worst now 5
  round 2 : flagged 0, total now 41, worst now 5
  round 3 : flagged 0, total now 41, worst now 5
  round 4 : flagged 0, total now 41, worst now 5
```

```
after 4 rounds
  policy A : total 25, worst 3, still flagging 3 per round
  policy B : total 41, worst 5, still flagging 0 per round
```

```
can the queue size answer 'is it getting better'
  policy A : no  - 3 every round, at every quality level
  policy B : yes - 5 at the start, 0 now
```

```
where each one ended
  policy A total : 25
  policy B total : 41
  A ended with the better system and a number that never moved
  B ended with the worse system and a number that reported success
```

**The measurement refused the simple version of this case.** Policy A's queue size never moves - but A also kept finding work after B had stopped, and ended with the better system (total 25 vs 41). So the relative rule is not simply worse; it is the one that cannot report its own success. Both facts are printed, because only printing the first would have been the tidier story rather than the measured one.

Verify it yourself:

```bash
pnpm eml run examples/fixing-the-flagged-ones-moved-the-threshold/fixing_the_flagged_ones_moved_the_threshold.eml
```
