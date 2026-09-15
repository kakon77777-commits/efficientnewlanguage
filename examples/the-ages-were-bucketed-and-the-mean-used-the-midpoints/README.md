# The ages were bucketed and the mean used the midpoints

`the_ages_were_bucketed_and_the_mean_used_the_midpoints.eml` - A survey reports the average age, computed as the weighted mean of the age-bucket midpoints, and the arithmetic is correct over every respondent. What a bucket midpoint stands in for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real recorded bucket for each respondent, not a guess; it covers every respondent; the weighted mean of the midpoints is honest; and the intent is exactly 'the average age'.

Only the bucket is recorded, never the age, so each respondent is placed at the center of the bucket - which is the true average only if ages sit symmetrically in every bucket, and the top bucket is open-ended with a chosen midpoint.

```
respondents                     : 100000
mean from bucket midpoints      : 42
mean from the raw ages          : 47
years the bucketing hid         : 5
understated share of the truth  : 1063 per ten thousand
```

```
the average-age computation
  reads : the real recorded bucket for each respondent
  covers : every respondent
  mean : the honest weighted mean of the midpoints
  intent : the average age
  respondents omitted : 0
  verdict : MIDPOINT MEAN IS 42, COMPUTED CORRECTLY
```

```
  taking the honest weighted mean of the midpoints over
  every respondent is the part done right here, and it is
  why 42 is the correct mean of the midpoints
```

```
the midpoint substitution
  what is recorded : the bucket, never the age
  what the midpoint assumes : the age sits at the bucket's
    center
  when that holds : only if ages are symmetric within each
    bucket
  the real distribution : skews old, and the top bucket is
    open-ended with a guessed center
  so the midpoint mean : is the mean of the assumption, not
    of the ages
```

```
the result of the survey
  reported average age : 42
  average from the raw ages : 47
  years hidden by the bucketing : 5
  is the midpoint mean miscomputed : no; 42 is exact for
    the midpoints
  is 42 the average age : no; interval censoring replaced
    each age with a center it need not sit at
```

```
null control - record the raw age, not only the bucket
  mean from midpoints : 42
  mean from raw ages : 47
  years the raw value recovers : 5
  no respondent and no bucket boundary changed; each age
  stopped being read as its bucket's center and started
  being read as itself
```

```
what a mean of bucket midpoints guarantees
  it is the correct mean of the midpoints : exactly, real
    buckets, every respondent, honest weighting
  it is the mean of the ages : not addressed; only the
    bucket is recorded, so each age becomes its bucket's
    center, and a skewed distribution plus an open top
    bucket moves the true mean to 47
```

```
a bucket keeps which interval a value fell in and forgets where inside it; the
midpoint puts it back at the center, which is a fact about the interval, not the
value, and a skew within the bucket is invisible to a mean of centers
```

It takes the honest weighted mean of the midpoints over every respondent - 42 is the exact midpoint mean. But only the bucket was recorded, so each age is read as its center; with a skewed distribution and an open top bucket the true mean is 47, 1063 per ten thousand understated, until the raw age is recorded.

Verify it yourself:

```bash
pnpm eml run examples/the-ages-were-bucketed-and-the-mean-used-the-midpoints/the_ages_were_bucketed_and_the_mean_used_the_midpoints.eml
```
