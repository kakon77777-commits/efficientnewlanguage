# The second time was faster, and that is all - MTTR down 56%, hours down unchanged to the hour

`the_second_time_was_faster_and_that_is_all.eml` computes both quantities from the same incident list so the two kinds of progress can be told apart.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: getting faster at recovery is real progress and it is the progress a team can actually make - it depends on runbooks, alerting, access and practice, all of which they control, while preventing the incident depends on a cause that may sit in someone else's system.

```
year   incidents   mean hours to recover   total hours down
  1      3           9.3                   28
  2      7           4.0                   28
```

```
the improvement the team reports
  mean time to recover : 9.3 -> 4.0
  improvement : 56%
```

```
what the users experienced
  total hours down : 28 -> 28
  unchanged - to the hour
```

```
decomposing the change in total hours
  incidents : 3 -> 7  (4 more)
  if the count had stayed at 3 with the new recovery time : 12
  if the recovery time had stayed at 9.3 with the new count : 65
  actual : 28
```

```
  recovering faster alone would have given : 12 hours
  the extra incidents alone would have given : 65 hours
  the two pull in opposite directions and the count wins
```

```
what each chart shows
  mean time to recover : better by 56%
  incident count       : worse by 133%
  hours down           : 0% - unchanged
  all three are correct, and only one of them is what users felt
```

```
control - the same recovery time, the original incident count
  incidents : 3
  total hours down : 12
  against year 1's 28
  here the faster recovery is the entire story, and it is a real one
```

Recovering faster is progress and the chart that shows it is honest. It is an average over incidents, so it says nothing about how many there are.

**The case was written expecting total damage to rise. It comes out exactly flat** - 28 hours to 28 hours - which is the sharper result, because the two effects cancel to the hour with no argument about magnitude left. The header was corrected to the measurement rather than the data to the header.

The **control** holds the count and keeps the faster recovery: there it is the entire story, and a real one.

Verify it yourself:

```bash
pnpm eml run examples/the-second-time-was-faster-and-that-is-all/the_second_time_was_faster_and_that_is_all.eml
```
