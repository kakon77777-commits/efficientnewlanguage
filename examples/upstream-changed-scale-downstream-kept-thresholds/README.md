# Upstream changed scale, downstream kept thresholds — both test suites green, the report worthless

`upstream_changed_scale_downstream_kept_thresholds.eml` scores twelve inputs on
the old scale and the new one, buckets both with the *same unchanged* code, and
compares the distributions.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the contract between the two stages was never written
down, because it was never a decision — it was an artefact of how the first
version happened to compute the number. "Scores are 0 to 100" lived in the
thresholds of the second stage and nowhere else, which left the first stage
free to change it without breaking anything it could see.

```
the same twelve inputs, scored two ways, bucketed by the SAME unchanged code
  scale 0-100  : high 4  medium 3  low 5  (total 12 of 12)
  scale 0-1000 : high 11  medium 0  low 1  (total 12 of 12)
```

Both sides keep their own tests, and both sets pass:

```
bucketing's own fixtures, written when the scale was 0-100
  fixtures failing: 0 of 6
  bucketing was not edited, so this could not have gone any other way

scoring's own fixtures, written for the new scale
  fixtures failing: 0 of 3
```

**The failure is quiet in the way that matters.** Every plausible sanity check
still holds:

```
properties that survive the change, and so cannot report it
  every record classified : True
  no negative counts      : True
  order preserved by score: True
```

Total records right, no bucket negative, every record classified, the ranking
unchanged. Only the distribution is wrong — and a distribution has no
obviously-correct value to compare against.

```
records that changed bucket: 7 of 12
buckets that ended up empty: 1
```

**The check that would have caught it belongs to neither stage:**

```
a range assertion at the seam, which nobody wrote
  scores outside the 0-100 the thresholds assume: 11 of 12
```

Scoring has no reason to bound its own output at 100. Bucketing has no reason
to reject an input it can classify. The assumption lived in the thresholds and
nowhere a change could reach it.

Verify it yourself:

```bash
pnpm eml run examples/upstream-changed-scale-downstream-kept-thresholds/upstream_changed_scale_downstream_kept_thresholds.eml
```
