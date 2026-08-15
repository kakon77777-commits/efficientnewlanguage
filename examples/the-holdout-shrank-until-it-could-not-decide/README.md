# The holdout shrank until it could not decide - and at an effect of 6 it still could

`the_holdout_shrank_until_it_could_not_decide.eml` enumerates every possible contiguous holdout of each size - nothing is sampled - and prints the range of measured effects.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: shrinking the holdout is the reasonable compromise: hold back fewer users, keep the machinery, keep the word "controlled" in the writeup. What it removes is the holdout's ability to tell the effect from which units happened to land in it.

```
units : 20
```

```
TRUE EFFECT 6.0
  holdout size   lowest   highest   spread
    1            1.7     10.2      8.5
    2            4.3     7.6      3.3
    4            5.1     6.6      1.5
    8            5.6     6.2      0.6
    12            5.2     6.0      0.8
    16            5.1     6.3      1.2
  can it rule out 'the change did nothing'
    size 1 : yes
    size 2 : yes
    size 4 : yes
    size 8 : yes
    size 12 : yes
    size 16 : yes
  smallest holdout that always answers : 1  (5%)
```

```
TRUE EFFECT 1.0
  holdout size   lowest   highest   spread
    1            -3.3     5.2      8.5
    2            -0.7     2.6      3.3
    4            0.1     1.6      1.5
    8            0.6     1.2      0.6
    12            0.2     1.0      0.8
    16            0.1     1.3      1.2
  can it rule out 'the change did nothing'
    size 1 : NO  - some choice reports -3.3
    size 2 : NO  - some choice reports -0.7
    size 4 : yes
    size 8 : yes
    size 12 : yes
    size 16 : yes
  smallest holdout that always answers : 4  (20%)
```

```
control - every unit has the same seasonal lift
  holdout of 1, across every choice : 6.0 to 6.0, spread 0.0
  one unit is enough, because there is nothing for the choice to vary
```

**This case was written expecting small holdouts to report zero or less, and at an effect of 6 they never do.** That result is kept and a second effect size is printed beside it rather than tuning the data until the original expectation held. What the two tables show together: the **spread is identical** at both effect sizes (8.5 at size 1, 0.6 at size 8) because it is a property of the units, not of the effect - but at an effect of 1.0 sizes 1 and 2 report negative numbers, and the smallest holdout that always answers moves from 5% of the population to 20%.

Which regime you are in is not visible from the measured number either.

Verify it yourself:

```bash
pnpm eml run examples/the-holdout-shrank-until-it-could-not-decide/the_holdout_shrank_until_it_could_not_decide.eml
```
