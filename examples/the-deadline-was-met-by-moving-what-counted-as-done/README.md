# The deadline was met by moving what counted as done

`the_deadline_was_met_by_moving_what_counted_as_done.eml` - 120 features were committed for the quarter. The quarter closed at 79 percent complete. What 79 percent counted is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The definition of done was narrowed on purpose, in a meeting, with the reason minuted, and the reason was a good one. Documentation was being written for features that later changed, so it was written twice. Deployment was gated on a release train that ran fortnightly, so a feature finished on a Monday sat unfinished for eleven days through no fault of the team. Counting those as incomplete made the burndown measure the release train instead of the work. Narrowing "done" to "merged" made the chart measure what the team controlled.

Every number the burndown reported was correct on the day it was drawn. The early numbers counted four stages and the later ones counted one. Nothing was restated, because each was accurate under the definition in force.

A percentage is a ratio of two counts. Changing what the numerator counts, while the denominator and the label stay put, moves the percentage without moving anything it describes.

```
committed for the quarter: 120 features
```

```
stage         reached   percent of commitment
  merged        95        79 pct
  tested        68        56 pct
  documented        51        42 pct
  deployed        47        39 pct
```

```
done under the definition in force at close  : 95 of 120 = 79 pct
done under the definition in force at start  : 47 of 120 = 39 pct
the same quarter, the same work, two true numbers
```

```
features counted done that still owe work: 48
```

```
stage still owed by those 48 features
  tested: 27 features have not reached it
  documented: 44 features have not reached it
  deployed: 48 features have not reached it
```

```
  the work did not disappear; it left the denominator of this quarter
  and entered the next quarter without appearing in its commitment
```

```
next quarter
  new features committed     : 120
  carried, not in the commitment: 48
  actual work in the quarter : 168
  the commitment is 71 pct of the work
  a team hitting 100 pct of that commitment finishes 71 pct of the quarter
```

```
control - raw stage counts, which no definition can move
stage         previous   this quarter   change
  merged        88         95          7
  tested        71         68          -3
  documented        55         51          -4
  deployed        52         47          -5
  stages that went down: 3 of 4
  merged rose; the three stages behind it all fell
  that is the signature of a pipeline filling faster than it drains
```

```
null control - both quarters under the same narrowed definition
  previous quarter, narrow definition : 88 of 120 = 73 pct
  this quarter, narrow definition     : 95 of 120 = 79 pct
  difference                          : 6 points
```

```
  previous quarter, wide definition   : 52 of 120 = 43 pct
  this quarter, wide definition       : 47 of 120 = 39 pct
  difference                          : -4 points
```

```
  held to the narrow definition the quarter improved, and that is real:
  the team merged more than it merged last quarter
  held to the wide definition the quarter declined, and that is real too
  the front of the pipeline sped up while the back of it fell behind
  the narrowed definition reports the front and is silent on the back
  the reported jump was neither of these: it compared a wide 43 to a narrow 79
```

```
what a redefinition does to a time series
  the new points are correct
  the old points are correct
  every comparison that spans the change is not
  and nothing in the chart marks where the change is
```

```
a restatement is the expensive, visible, honest option
the cheap option is to leave both halves standing and let the reader join them
```

Narrowing done to merged made the burndown measure the team instead of the release train, which is what a burndown is for, and the reason was minuted. The quarter closed at 79 pct. Under the definition it opened with it closed at 39 pct, three of four stage counts fell against the previous quarter, and 48 features entered the next quarter owing work that no commitment counts.

Verify it yourself:

```bash
pnpm eml run examples/the-deadline-was-met-by-moving-what-counted-as-done/the_deadline_was_met_by_moving_what_counted_as_done.eml
```
