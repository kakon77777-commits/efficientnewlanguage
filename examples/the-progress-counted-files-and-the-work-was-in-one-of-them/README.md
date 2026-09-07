# The progress counted files and the work was in one of them

`the_progress_counted_files_and_the_work_was_in_one_of_them.eml` - The migration shows a progress bar that updates after every file, never goes backwards, and reports exactly what it has finished. What it is a fraction of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The bar is honestly built. It is not a fake animation and not an estimate from a model: it counts files that are completely written and verified, it never moves backwards, it does not jump to ninety and wait, and if the job dies the count is the true number of files that are done. An operator who reads it as "this many files are finished" is reading it correctly.

It counts FILES. The sizes are not uniform - one file holds most of the bytes - so the fraction of files done and the fraction of work done are different numbers, and only the first is displayed.

The bar reads complete when one file is left.

```
files                           : 1240
files done when one remains     : 1239
  the bar then reads            : 9991 per ten thousand
progress measured in bytes      : 0
```

```
total gigabytes                 : 4100
  in the largest file, percent  : 61
  in the largest file, GB       : 2501
  in all the rest, percent      : 39
```

```
minutes elapsed at that point   : 40
minutes still remaining         : 96
total minutes                   : 136
  elapsed share                 : 2941 per ten thousand
```

```
the progress bar
  what it counts : files completely written and verified
  does it move backwards : no
  does it jump to ninety and wait : no
  if the job dies, is the count true : yes; that many
    files are done
  is it an estimate : no
  verdict : ACCURATE
```

```
  counting completed and verified work rather than issued
  work is the honest choice and it is the one made
```

```
the denominator
  what the fraction is over : files
  what the operator is deciding with it : time
  what relates the two : bytes per file
  distribution of those : one file holds 61 percent
  bars measured in bytes : 0
  the two fractions at the same instant : 9991 and
    2941 per ten thousand
```

```
  both fractions are correct and they are fractions of
  different things
```

```
the decision
  what the operator asks : can I go home
  what the bar answers   : how many files are done
  bar reading            : 9991 per ten thousand
  time actually elapsed  : 2941 per ten thousand
  minutes still to run   : 96
  is the bar lying       : no
```

```
the file sizes
  uniform : no, and there was never a reason to expect it
  largest file, GB : 2501
  everything else, percent of bytes : 39
  is that a defect in the data : no
  did the bar's author know the distribution : it is
    knowable with one query, which the bar does not run
```

```
weighting by bytes
  what it needs : the size of each file, before starting
  is that available : yes, from the source listing
  what it would show at the same instant : 2941
    per ten thousand, roughly
  what it gives up : nothing; the count is still exact
  why it was not done : the count was the obvious thing
    to increment
```

```
null control - the fraction is taken over bytes
  files done : 1239, unchanged and still exact
  progress measured in bytes : 1
  bar reading when one file remains : 2941 per ten
    thousand
  the bar did not become more truthful; its denominator
  became the thing the operator is waiting for
```

```
what an honest progress bar guarantees
  this fraction of the items is finished : exactly, never
    backwards, true even if the job dies
  this fraction of the wait is over : not addressed; the
    fraction is over items and the wait is over work
```

```
a fraction is only as informative as the uniformity of what
it counts; counting items is exact and counting them is a
proxy for time only when the items are the same size, which
is a property of the data rather than of the counter
```

The bar counts files that are completely written and verified, never moves backwards, and stays true if the job dies. It is a fraction over 1240 files whose bytes are not uniform - one holds 2501 of 4100 GB - so with one file left it reads 9991 per ten thousand while 2941 per ten thousand of the time has passed, and 96 of 136 minutes are still ahead.

Verify it yourself:

```bash
pnpm eml run examples/the-progress-counted-files-and-the-work-was-in-one-of-them/the_progress_counted_files_and_the_work_was_in_one_of_them.eml
```
