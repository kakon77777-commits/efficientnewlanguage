# The reporters are not the affected

`the_reporters_are_not_the_affected.eml` - Forty-one people reported the bug. How many hit it is computed below, and the two numbers are about different populations.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Counting reports is the right way to rank work and it is what every tracker is built to do. A report is a real person taking real trouble to describe a real failure, and a bug with forty-one of them is not a rumour.

Reporting requires knowing the behaviour is wrong, knowing where to report, and having a reason to spend the time. Each of those filters the population, and none of them is correlated with severity. So the report count is a count of people who cleared three filters, and the affected set is somewhere else.

Both are computed per user segment.

```
users affected : 11780
reports filed  : 239
  reports per 1000 affected : 20
```

```
segment          affected   notice   know where   bother   reports
  power users   300      90%      80%          40%      86
  daily users   2400      40%      30%          15%      43
  occasional   5100      15%      10%          5%      3
  trial   3800      10%      5%          2%      0
  api integrators   180      95%      90%          70%      107
```

```
largest affected segment : occasional (5100)
largest reporting segment : api integrators (107 reports)
  different segments, so the tracker ranks by the second one
```

```
reports per 1000 affected, by segment
  power users : 286
  daily users : 17
  occasional : 0
  trial : 0
  api integrators : 594
  loudest : api integrators at 594 per 1000
  quietest: api integrators at 594 per 1000
  the loudest segment reports 1 times as often per affected user
```

```
correcting the report count back to an affected count
  power users : multiply reports by 3
  daily users : multiply reports by 55
  occasional : multiply reports by 1700
  api integrators : multiply reports by 1
  the multiplier is different per segment and none of them is 1, so a single
  correction factor is not available
```

```
  trial : 3800 affected, 0 reports
affected users in segments producing no reports at all : 3800
  they are not absent from the data; they are absent from the tracker
```

```
control - the same bug with automatic client-side error reporting
  filters between hitting it and it being counted : 0
  what is counted : occurrences
  what is lost    : the description, which is the part a human report has
  and the automatic one does not
```

Forty-one people took trouble to describe a real failure and the tracker is right to record them. Reporting needs three things that severity does not, and the count is of people who had all three.

Verify it yourself:

```bash
pnpm eml run examples/the-reporters-are-not-the-affected/the_reporters_are_not_the_affected.eml
```
