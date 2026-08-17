# The error metric has no sign

`the_error_metric_has_no_sign.eml` - Two forecasting models are scored by absolute error. The score ranks them equal. They are not the same model.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Absolute error is the right default. It refuses to let a miss of +5 cancel a miss of -5, which is exactly what a plain average of errors would do, and cancellation is the worse failure - it reports a model as perfect when every single prediction was wrong.

`abs()` buys that by throwing away the sign, and the sign is the part that says which way the model is wrong. A model that is always high and a model that is high and low by turns score identically, and only one of them can be corrected by subtracting a constant.

Both scores are computed from the same predictions.

```
periods : 6
```

```
model   total |error|   total error   worst miss
  A       18           0            4
  B       18           18           4
  C       12           0            6
```

```
A and B score identically on absolute error : 18
and differ on signed error by 18
```

```
direction of the misses
  A : 3 high, 3 low
  B : 6 high, 0 low
  B misses in one direction only, so a constant correction applies to it
```

```
correcting B by its mean signed error of 3
  B before : 18
  B after  : 4
  improved by 14 with no new information
the same correction applied to A, whose offset is 0
  A before : 18
  A after  : 18
  unchanged, because there was no constant offset to remove
```

```
cost at 2 per unit over and 5 per unit short
  A : 63
  B : 36
  C : 42
  A and B scored equal on absolute error and differ here by 27
  the biased model is the cheaper one, because it is biased in the
  direction that costs 2 rather than 5
```

```
C against A
  absolute total : 12 versus 18
  worst miss     : 6 versus 4
  C is better on the total and worse on the worst case, and both are true
```

```
control - a model that is closer on every period
  |error| : 6 versus A's 18
  cost    : 18 versus A's 63
  both metrics agree, so this comparison cannot tell them apart
```

Absolute error is the right default and the cancellation it prevents is a real failure. The sign it discards is the part that says whether the model can be corrected, and what being wrong costs.

Verify it yourself:

```bash
pnpm eml run examples/the-error-metric-has-no-sign/the_error_metric_has_no_sign.eml
```
