# The noisiest check is relaxed first — 7 of 7 defects caught, then 4

`the_noisiest_check_is_relaxed_first.eml` runs a threshold-tuning policy for
several rounds and measures what the suite can still catch after each one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the policy is "raise the threshold on whichever check is
making the most noise". That is reasonable in every individual application — a
check that fires constantly is not being read, and an unread check is worse than
no check because it also consumes the attention a real alarm would need.

```
round  thresholds        alarms per check     defects caught
  0    [1, 4, 8, 20]   [16, 7, 4, 1]   7 of 7
  1    [2, 4, 8, 20]   [12, 7, 4, 1]   7 of 7
  2    [4, 4, 8, 20]   [7, 7, 4, 1]   7 of 7
  3    [8, 4, 8, 20]   [4, 7, 4, 1]   7 of 7
  4    [8, 8, 8, 20]   [4, 4, 4, 1]   4 of 7
```

**Applied repeatedly, the policy has a direction:**

```
threshold, start and end
  check A : 1 -> 16  (raised)
  check B : 4 -> 8   (raised)
  check C : 8 -> 8
  check D : 20 -> 20
  checks raised : 2 of 4

defects the suite catches
  before the policy ran : 7 of 7
  after                 : 4 of 7
  lost                  : 3
```

The check that fires most is the most *sensitive* one, and sensitivity is the
property the suite exists to have. Nothing in the policy ever raises a threshold
on a check that rarely fires, so the checks that survive untouched are the ones
that were already too blunt to notice anything — C and D here were never
considered.

**And it delivered exactly what was asked of it:**

```
total alarms across the suite
  before : 28
  after  : 11
  the policy achieved exactly what it was asked to achieve
```

Noise events are in the stream on purpose. Without them the policy has nothing
to react to and the argument for it disappears — the case has to grant the
premise to be about anything.

Every application of the policy was justified on its own terms. The direction is
toward a suite that is quiet because there is nothing left in it that can speak.

**Related.** [axis 16](../../assessment/04-method.md) measures which classes of
defect the corpus can expose at all; this case is the same question asked about a
suite that is losing that ability one reasonable decision at a time.

Verify it yourself:

```bash
pnpm eml run examples/the-noisiest-check-is-relaxed-first/the_noisiest_check_is_relaxed_first.eml
```
