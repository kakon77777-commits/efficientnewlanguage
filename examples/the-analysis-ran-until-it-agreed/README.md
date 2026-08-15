# The analysis ran until it agreed - 4 of 10 segments up, in data with an effect of exactly zero

`the_analysis_ran_until_it_agreed.eml` cuts a flat overall result by segment and counts how many segments have to be tried before one is up.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: segmenting is how real findings are made. Effects genuinely do concentrate - in new users, on mobile, in one region - and a team that reported only the average would be missing the thing that matters. The instinct is sound and the analysis is arithmetic.

```
overall, weighted by users : 0.0
```

```
segment          users   measured
  new users   120     0.9
  returning   900     -0.1
  mobile   600     -0.2
  desktop   420     0.4
  region A   300     -0.3
  region B   180     0.7
  region C   60     1.4
  enterprise   40     -1.1
  free tier   980     -0.1
  trial   90     0.6
```

```
  segments up   : 5 of 10
  segments down : 5
```

```
trying segments in order, until one is up
  1 segment(s) tried, and new users is up by 0.9
```

```
the ones that are up, by size
  new users : 120 users, 0.9
  desktop : 420 users, 0.4
  region B : 180 users, 0.7
  region C : 60 users, 1.4
  trial : 90 users, 0.6
  users in the up segments   : 870
  users in the down segments : 2820
  the positive story covers the smaller part of the population
```

```
the largest measured lift
  region C : 1.4 on 60 users
the smallest segment
  enterprise : 40 users, -1.1
  they are NOT the same segment - the largest lift sits in a segment of
  60 while the smallest has 40
```

```
average segment size
  among the ones that are up   : 174
  among the ones that are down : 564
```

```
control - a world with a real effect of about 3.0
  overall : 2.9
  segments up : 4 of 4
  every segment agrees, and the average said so first
```

**The tidy version of this case would say the biggest lift is always in the smallest segment. Measured over these ten, it is not** - the smallest segment here is one that went down, and the program prints that rather than staying silent when the expected pattern fails. What does hold is duller: the up segments carry 870 users against the down segments' 2820.

A never-incremented index was found here by reading the output - the same defect class this line caught in itself on 2026-08-13, committed a second time.

Verify it yourself:

```bash
pnpm eml run examples/the-analysis-ran-until-it-agreed/the_analysis_ran_until_it_agreed.eml
```
