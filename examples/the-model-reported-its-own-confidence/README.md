# The model reported its own confidence

`the_model_reported_its_own_confidence.eml` - The classifier decides a document only when it is confident, and everything below the threshold goes to a person. Where the confidence comes from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The gate is well built. The threshold was chosen on a held-out set rather than picked; the abstention rate is on a dashboard, so a model that quietly stops abstaining is visible; abstentions go to a real queue with a real service level rather than to a folder; and a sample of the automatic decisions is adjudicated by hand every day, so the error rate is measured and not assumed.

The confidence is the model's own, and it was calibrated on the distribution the model was trained on.

```
documents a day                 : 52000
  sent to a human               : 4160
  decided automatically         : 47840
  abstained                     : 800 per ten thousand
threshold, times one hundred    : 85
months the gate has run         : 26
```

```
automatic decisions audited     : 400
  errors found                  : 6
  error rate                    : 150 per ten thousand
```

```
documents from the new source   : 3100
  audited                       : 300
  errors found                  : 74
  error rate                    : 2466 per ten thousand
  mean confidence, times hundred: 93
  abstained                     : 677 per ten thousand
calibration sets drawn since    : 0
```

```
the two rates, as a difference
  error, new source less overall: 2316 per ten thousand
  abstention, overall less new  : 123 per ten thousand
```

```
the abstention gate
  the threshold : chosen on a held-out set, not picked
  the abstention rate : on a dashboard, so a model that
    quietly stops abstaining is visible
  where abstentions go : a real queue with a real
    service level, not a folder
  the automatic decisions : 400 adjudicated by hand
    every day, so the error rate is measured
  verdict : GATED
```

```
  adjudicating a daily sample of the AUTOMATIC decisions
  is the part almost nobody does, and it is why the 
  150 per ten thousand is a measurement
```

```
what the number in the gate is
  who produces it : the model
  what it is : how well the input matched what the model
    learned, expressed as certainty
  what it was calibrated against : the distribution the
    model was trained on
  calibration sets drawn since the new source arrived : 
    0
  so on an input unlike that distribution : the number
    is produced by the same machinery that is wrong
```

```
  the gate asks the model whether to trust the model
```

```
documents from a form layout nobody calibrated on
  error rate there : 2466 per ten thousand
  error rate overall : 150 per ten thousand
  so the difference : 2316 per ten thousand
  mean confidence there : 93, against a
    threshold of 85
  abstention there : 677 per ten thousand
  abstention overall : 800 per ten thousand
```

```
  it abstains LESS on the source it is wronger about,
  by 123 per ten thousand, and that is not a
  malfunction - it is what a confidence calibrated
  elsewhere says here
```

```
null control - recalibrate on a sample that includes it
  abstentions from the old sources : 
    4160, unchanged
  calibration sets drawn since : 1
  new-source documents that now abstain : 
    2900 of 3100
  the model did not get better; the number the gate reads
  was made to be about the documents it is reading
```

```
what a confidence gate guarantees
  a document the model is unsure about goes to a person
    : exactly, threshold 85, 26 months, rate on a
    dashboard, queue with a service level
  a document the model is wrong about goes to a person :
    not addressed; the gate reads the model's own
    certainty, and being wrong without doubt is the
    failure it cannot see
```

```
a self-reported certainty is a measurement of fit to what
was seen before; where that fit is worst the report is
least able to say so, and nothing here asks anyone else
```

The threshold came from a held-out set, abstentions go to a queue with a service level, and 400 automatic decisions are adjudicated by hand daily at 150 per ten thousand error. The confidence is the model's own, calibrated before a source that now sends 3100 documents a day: there it errs at 2466 per ten thousand while abstaining 123 per ten thousand LESS than it does elsewhere.

Verify it yourself:

```bash
pnpm eml run examples/the-model-reported-its-own-confidence/the_model_reported_its_own_confidence.eml
```
