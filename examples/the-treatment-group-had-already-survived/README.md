# The treatment group had already survived

`the_treatment_group_had_already_survived.eml` - Patients in a follow-up program lived longer than patients not in it, and the survival times are real and correctly averaged. What defines who is 'in the program' is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It uses the real recorded death dates, not estimates; it covers every patient; the mean survival is the honest average of the months lived; and the intent is exactly 'does the program extend life'.

To be counted as a program patient you had to reach the six-month enrollment visit, so every early death is filed as not-in-program by definition - the program group is guaranteed to have already survived six months.

```
patients total                  : 1000
  in the program (survived to enroll) : 800
  died before the enrollment visit    : 200
```

```
mean months, program            : 30
mean months, no program         : 12
claimed advantage               : 18 months
advantage by landmark analysis  : 4 months
from immortal time              : 7777 per ten thousand
```

```
the survival measurement
  uses : real recorded death dates, not estimates
  covers : every patient, all 1000
  mean survival : the honest average of months lived
  intent : does the program extend life
  patients omitted : 0
  verdict : PROGRAM PATIENTS LIVED 18 MONTHS LONGER
```

```
  using the real death dates over every patient is the
  part done right here, and it is why the 18-month gap is a
  true difference between the two recorded groups
```

```
membership in the program group
  the rule : attended the six-month enrollment visit
  what that visit requires : surviving to month six
  where an early death is filed : not-in-program, always
  so the program group cannot contain : anyone who died
    before month six
  the six months it is guaranteed : are counted as program
    survival, though no one was treated during them
```

```
the conclusion drawn
  program adds : 18 months of life
  months guaranteed by the entry rule alone : the immortal
    time before enrollment
  advantage once the clock starts at enrollment : 4 months
  are the death dates wrong : no; they are exact
  is 18 the program's effect : no; 7777 per ten
    thousand of it is time the group had already survived
```

```
null control - start the clock at enrollment
  advantage, clock at diagnosis : 18 months
  advantage, clock at enrollment : 4 months
  early deaths no longer credited against no-program : 200
  no patient and no date changed; the guaranteed survival
  stopped being counted as a result of the program
```

```
what a group-vs-group survival comparison guarantees
  each group's mean survival is correct : exactly, real
    dates, every patient, honest average
  the program caused the difference : not addressed; entry
    requires surviving to month six, so the program group
    holds no early death and carries six guaranteed months -
    a landmark analysis cuts the 18 to 4
```

```
a group defined by having received a treatment is also defined by having lived
long enough to receive it; the waiting time cannot contain a death, so it is
immortal, and crediting it to the treatment measures survival that was required
to enter, not survival that was caused
```

It averages real death dates over every patient - the 18-month gap is true. But program membership requires reaching the six-month visit, so the group has already survived six months and holds no early death; starting the clock at enrollment leaves 4 months, 7777 per ten thousand of the claim being immortal time.

Verify it yourself:

```bash
pnpm eml run examples/the-treatment-group-had-already-survived/the_treatment_group_had_already_survived.eml
```
