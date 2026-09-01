# The model was retrained and the labels came from the old one

`the_model_was_retrained_and_the_labels_came_from_the_old_one.eml` - The model is retrained monthly on fresh data and its holdout accuracy is up again. What it got better at is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pipeline is sound. The holdout is split before any feature is computed, no row appears in both halves, the split is by customer rather than by row so nothing leaks across, and the metric is computed once at the end by a job nobody can rerun until the next month. The number it produces is honest.

Accuracy is measured AGAINST LABELS. Two percent of them are human decisions. The other ninety-eight are last month's model's predictions, written back because reviewing eight million rows by hand is not possible.

So the metric asks how well this model agrees with the previous one, and the answer to that has been going up for five months.

```
training rows           : 8600000
  labelled by a human   : 172000
  labelled by last month's model : 8428000
```

```
holdout accuracy before : 9210 per ten thousand
holdout accuracy after  : 9640 per ten thousand
headline gain           : 430 per ten thousand
```

```
the evaluation
  split before feature computation : yes
  rows in both halves              : 0
  split by customer, not by row    : yes
  metric computed once, by a job nobody can rerun : yes
  verdict                          : NO LEAKAGE
```

```
  every one of those is a real precaution and each of them
  prevents a real failure; none of them is theatre
```

```
where the answer key comes from
  human decisions       : 172000
  previous model output : 8428000
  share from the model  : 9800 per ten thousand
```

```
  the holdout is split from the same pool, so both halves
  are labelled the same way; the leakage check is looking
  for rows crossing the split and the problem is upstream
  of it
```

```
accuracy on the human-reviewed subset
  before : 9180 per ten thousand
  after  : 9120 per ten thousand
  change : -60 per ten thousand
```

```
  the headline moved 430 the other way; the two numbers
  are measuring agreement with two different things
```

```
over 5 months at this rate
  headline improvement, per ten thousand : 2150
  measured against people                : falling
  reviewers asked to check more rows     : no, the metric
    is going up
```

```
null control - a human-labelled holdout, same training pool
  leakage verdict          : unchanged, still none
  holdout rows from the model : 0
  holdout accuracy after   : 9120 per ten thousand
  the model did not get worse; the metric started
  answering the question it was being read as answering
```

```
what a clean holdout guarantees
  the metric is not inflated by seen rows : exactly
  the metric measures being right         : not addressed;
    it measures agreement with the labels, and where the
    labels come from is upstream of every split
```

```
a leakage check compares the two halves of a pool and cannot
see a property both halves share; when the model wrote the
answer key, the loop closes above the line the check draws
```

The pipeline is clean and the evaluation is honest: split before features, 0 rows in both halves, split by customer, computed once. 9800 per ten thousand of the labels are the previous model's own output, so the headline rose 430 per ten thousand while accuracy on the 172000 rows a person actually decided moved -60 - and this is the fifth month of it.

Verify it yourself:

```bash
pnpm eml run examples/the-model-was-retrained-and-the-labels-came-from-the-old-one/the_model_was_retrained_and_the_labels_came_from_the_old_one.eml
```
