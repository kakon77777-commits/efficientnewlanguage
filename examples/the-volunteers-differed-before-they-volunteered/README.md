# The volunteers differed before they volunteered

`the_volunteers_differed_before_they_volunteered.eml` - Employees who joined the wellness program are 20 points healthier than those who did not. The scores are real and the comparison is honest. What made someone a participant is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real recorded health scores, not self-reports; it covers every employee; the group comparison is the honest difference of means; and the intent is exactly 'does the program improve health'.

Joining was voluntary, and the already health-conscious are the ones who joined, so the participants were healthier before the program began - the after-gap includes a gap that was there at the start.

```
participants                    : 500
non-participants                : 500
```

```
participant health   before / after : 75 / 80
non-participant       before / after : 62 / 60
```

```
gap after the program           : 20
gap before the program          : 13
effect by change-from-baseline  : 7
pre-existing share of the gap   : 6500 per ten thousand
```

```
the health comparison
  reads : real recorded health scores, not self-reports
  covers : every employee
  comparison : the honest difference of group means
  intent : does the program improve health
  employees omitted : 0
  verdict : PARTICIPANTS ARE 20 POINTS HEALTHIER
```

```
  reading real scores over every employee is the part done
  right here, and it is why the 20-point after-gap is a
  true difference between the two groups
```

```
how the groups were formed
  the rule : each employee chose whether to join
  who chooses to join : the already health-conscious
  so at baseline the joiners were : 13 points healthier
    already, before any program
  what the after-gap contains : that pre-existing 13 plus
    whatever the program did
  what a cross-section cannot separate : the effect from
    who selected in
```

```
the conclusion drawn
  program makes people : 20 points healthier
  gap that predated the program : 13
  effect once each group is measured against itself : 7
  are the scores wrong : no; they are exact
  is 20 the program's effect : no; 6500 per ten
    thousand of it was there before the program
```

```
null control - compare change-from-baseline, not the after-cross-section
  gap by raw after-cross-section : 20
  effect by change-from-baseline : 7
  baseline gap the matching removes : 13
  no employee and no score changed; the 20 stopped being
  read as an effect and started being read against where
  each group began
```

```
what a participant-vs-non-participant comparison guarantees
  the two groups differ by the measured amount now : exactly,
    real scores, every employee, honest difference
  the program caused the difference : not addressed;
    joining was voluntary and the health-conscious joined,
    so the groups differed by 13 at baseline - change-from-
    baseline leaves the program only 7 of the 20
```

```
when the treated choose themselves, the groups differ before the treatment does
anything, and a comparison taken only afterward measures who opted in as much as
what they opted into; the baseline gap is charged to the program that did not
open it
```

It reads real scores over every employee with an honest group difference - the 20-point gap is true. But joining was voluntary and the health-conscious joined, so the groups differed by 13 at baseline; change-from-baseline leaves 7 for the program, 6500 per ten thousand of the gap predating it.

Verify it yourself:

```bash
pnpm eml run examples/the-volunteers-differed-before-they-volunteered/the_volunteers_differed_before_they_volunteered.eml
```
