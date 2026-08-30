# The sample was taken after the filter

`the_sample_was_taken_after_the_filter.eml` - A quality audit draws five hundred records at random from the processed table and finds a defect rate of two per thousand. What that table contains is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The sampling is correct and it was done properly. The draw is uniform, the sample size was chosen from the width of the interval the audit needed, the records were pulled without replacement, and nobody chose which ones. Within its frame the estimate is unbiased and the confidence interval is real.

A sample estimates the population it is DRAWN FROM. The processed table is not the population the audit is reporting on; it is what survived ingestion, and ingestion drops what it cannot parse.

The records that failed are the ones the question is about, and they were removed before the sampling frame existed.

```
records submitted        : 240000
rejected at ingestion    : 19200
reached the table        : 220800
sample drawn from        : the table
sample size              : 500
```

```
what the audit reports
  defect rate in the sample : 20 per ten thousand
  drawn uniformly           : yes
  chosen by a person        : no
  replacement               : none
  the estimate is unbiased for the table
```

```
the frame the estimate describes
  records in the table      : 220800
  estimated defects there   : 441
  records NOT in the table  : 19200
  defects among those       : 19200, by definition
```

```
  a record is in the second group BECAUSE it was malformed,
  so that group's defect rate is not estimated, it is known,
  and it is total
```

```
defect rate, two frames
  over the table     : 20 per ten thousand
  over what was sent : 818 per ten thousand
  ratio              : 40 times
```

```
  both numbers are correct about their own denominator
  the report names neither denominator
```

```
the pipeline, in order
  1  records are submitted            240000
  2  ingestion parses and drops       19200 removed
  3  the table receives               220800
  4  the audit samples                500 from step 3
```

```
  the audit is asking about step 1 and drawing from step 3
  and steps 1 and 3 differ by exactly the records that failed
```

```
a sample ten times larger
  sample size           : 5000
  drawn from            : the table, still
  interval width        : narrower
  estimate              : 20 per ten thousand, more precisely
  rejected records included : 0
```

```
  precision improves and the frame does not move
```

```
control - is the sampling correct
  selection bias within the table : none
  sample size adequate            : yes, for the stated interval
  records excluded by the sampler : 0
  defects in the method           : 0
```

```
  nothing about the draw needs fixing; what needs stating is
  the sentence 'of the records that reached the table'
```

```
null control - the same sample drawn from the submission log
  frame              : 240000 submitted records
  sample size        : 500, unchanged
  method             : unchanged
  estimated rate     : 818 per ten thousand
  the sampler did not improve; it was pointed at the population
  the report was already describing
```

```
what a sample is evidence about
  the frame it was drawn from : exactly, and with an interval
  the population upstream of a filter : nothing at all
  and a filter that removes failures makes the two differ by
  precisely the thing being measured
```

```
the question to ask of any rate is not how many were sampled,
it is what had to happen to a record for it to be eligible
```

The draw is uniform, unbiased and adequately sized, and 20 per ten thousand is a correct estimate for the 220800 records in the table. Ingestion dropped 19200 records for being malformed, which is the defect the audit exists to count, so over the 240000 actually submitted the rate is 818 per ten thousand - 40 times the reported one - and a larger sample moves the interval, not the frame.

Verify it yourself:

```bash
pnpm eml run examples/the-sample-was-taken-after-the-filter/the_sample_was_taken_after_the_filter.eml
```
