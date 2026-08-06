# Survivorship in cohorts — satisfaction rises as the product gets worse

`survivorship_in_cohorts.eml` tracks three quantities over eight periods of a
steadily worsening product: how many users remain, their average tolerance, and
their average headroom.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a metric computed over the users who are still here is
computed over a sample that the thing being measured selected.

Mean tolerance among survivors rises on **every** step and the population falls
on **every** step. Not usually — every one, because the selection is
deterministic. Nobody's tolerance changed: the leavers are less tolerant than
the stayers in **8 of 8** periods.

The control that rules out the alternative explanation: the same statistic over
the **full cohort** — everyone who ever signed up — does not move at all,
because tolerance is a fact about a user and not about a period. Only the
sample moved.

**The third series is the one the file could not settle in advance.** Mean
headroom (tolerance minus the current annoyance) has two effects pulling on it:
annoyance rises for everyone, and the survivors are increasingly tolerant.
Which wins is a measurement, not an argument — and it falls on every step. The
survivor bias is real and not large enough to outrun the annoyance it selects
on. That direction is now a check, so it is a result rather than a guess.

Everything is integer and nothing is random, so the result is a property of the
shape rather than of a seed.

Verify it yourself:

```bash
pnpm eml run examples/survivorship-in-cohorts/survivorship_in_cohorts.eml
```

```bash
pnpm eml trace examples/survivorship-in-cohorts/survivorship_in_cohorts.eml --run
```
