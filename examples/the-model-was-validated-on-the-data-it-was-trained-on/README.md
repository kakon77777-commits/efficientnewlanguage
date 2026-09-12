# The model was validated on the data it was trained on

`the_model_was_validated_on_the_data_it_was_trained_on.eml` - The classifier scored 98 per hundred at validation, and the score is real. What set it was scored on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The evaluation is done carefully. Accuracy is computed on real labels, not the model's own guesses; the metric is checked against a confusion matrix; the threshold was fixed before scoring; and the number is signed off before release.

The rows it was scored on are the rows it was trained on.

```
rows scored                     : 40000
rows trained on                 : 40000
  held back for validation      : 0
in-sample accuracy              : 9820 per ten thousand
```

```
unseen rows from a later batch  : 12000
out-of-sample accuracy          : 8730 per ten thousand
  generalization gap            : 1090 per ten thousand
unseen rows called right        : 10476
```

```
the validation
  accuracy on : real labels, not the model's guesses
  checked against : a confusion matrix
  threshold : fixed before scoring
  sign-off : before release
  rows called right : 39280
  verdict : ACCURATE
```

```
  fixing the threshold before scoring is the part almost
  nobody resists moving, and it is why the number was not
  tuned to itself
```

```
the scoring set
  which rows : the training rows
  rows held back for a fair test : 
    0
  what a model can do to those rows : memorize them
  so a high score on them : measures recall of the
    training set, not skill on new data
  what it does not measure : generalization
```

```
the rows the model never saw
  count : 12000
  accuracy on them : 8730 per ten thousand
  the validation figure : 9820 per ten thousand
  the drop : 1090 per ten thousand
  is the validation number wrong : no; it is a correct
    in-sample accuracy
  is it the number a buyer thinks they are getting : no
```

```
null control - score on a withheld holdout
  in-sample accuracy : 9820, unchanged
  holdout accuracy : 8730 per ten thousand
  numbers that change meaning : 1
  no row and no label changed; the scoring set stopped
  being the set the model had already seen
```

```
what a high validation accuracy guarantees
  the model reproduces the labels it was scored on :
    exactly, real labels, fixed threshold, signed off
  the model generalizes : not addressed; the accuracy was
    measured on the rows it was fit to, and a model can
    memorize those - on 12000 unseen rows it scores 
    8730
```

```
a score on the training set measures memory, and a score on held-out data
measures skill; the two coincide only for a model that did not overfit, which
is the very thing the in-sample number cannot tell you
```

Accuracy is on real labels against a confusion matrix, threshold fixed, signed off - 9820 per ten thousand. It was scored on its own training rows, which a model can memorize, so 12000 unseen rows score 8730, a gap of 1090 per ten thousand under 0 rows held back.

Verify it yourself:

```bash
pnpm eml run examples/the-model-was-validated-on-the-data-it-was-trained-on/the_model_was_validated_on_the_data_it_was_trained_on.eml
```
