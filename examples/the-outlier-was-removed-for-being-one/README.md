# The outlier was removed for being one - 0 instances of the investigated thing survive cleaning

`the_outlier_was_removed_for_being_one.eml` computes the statistics with and without the cleaning rule and counts how many genuine slow paths each dataset still contains.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: removing outliers is standard and usually right - a sensor glitch, a test account, a duplicated import. The rule is simple, documented and consistently applied. It is also defined by exactly the property being looked for, and it does not know why a point is far out.

```
requests : 12
```

```
with everything
  kept  : 12
  mean  : 254
  worst : 910
```

```
after the cleaning rule
  kept  : 9
  mean  : 41
  worst : 45
```

```
what the rule removed
  points removed : 3
  of those, genuine slow paths : 3
  of those, glitches : 0
  every removed point was real
```

```
the investigation
  question : why are some requests slow
  genuine slow requests in the data : 3
  genuine slow requests surviving the cleaning : 0
  the cleaned data contains no instance of the thing being investigated
```

```
what each dataset supports
  typical latency, for capacity planning : cleaned, 41
  what the slowest users experience      : cleaned cannot say
  how often the slow path is taken       : 25% - only in the raw data
```

```
control - a dataset whose far point is a sensor glitch
  removed : 1, of which genuine : 0
  here the rule removes only noise, and it is exactly the right thing to do
```

The rule is correct, documented and consistently applied. It selects on distance from the mean, and so does the question.

The **control** is a dataset whose far point really is a glitch: there the rule removes only noise and is exactly the right thing to do.

Verify it yourself:

```bash
pnpm eml run examples/the-outlier-was-removed-for-being-one/the_outlier_was_removed_for_being_one.eml
```
