# The forecast triggered its own refutation - 100% of the filed error was created by acting on it

`the_forecast_triggered_its_own_refutation.eml` computes the observed world, the world the forecast was about, and next year's correction.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the forecast was acted on, which is what forecasts are for. Acting meant provisioning, and provisioning included a per-tenant cap so one noisy tenant could not consume the new capacity. The cap is what held usage down - so the number the forecast is graded against was produced by a world the forecast itself created.

```
the forecast, made before anything was provisioned
  forecast : 900
```

```
what happened
  observed usage : 570
  forecast error as filed : 36% over
```

```
the world the forecast was about, which no longer exists
  demand, uncapped : 900
  forecast error against THAT : 0% over
```

```
  gap between the two worlds : 330
  filed error                : 330
  share of the filed error created by acting on the forecast : 100%
```

```
per tenant
  t1 : wanted 180, got 120  (-60)
  t2 : wanted 140, got 120  (-20)
  t3 : wanted 260, got 120  (-140)
  t4 : wanted 90, got 90
  t5 : wanted 230, got 120  (-110)
  tenants at the cap : 4 of 5
```

```
next year, the forecaster shades down by a quarter
  new forecast : 675
  observed (cap still in place) : 570
  error as filed : 15% over
  error against uncapped demand : 25% UNDER
  the correction that looked right made it too small for the real world
```

```
control - a forecast filed and not acted on
  forecast : 900
  observed : 900
  error    : 0% over
  here the observation and the forecast are about the same world
```

A forecast that is acted on is graded against the world its own output made. The gap is real, the arithmetic is right, and the thing being measured is not the thing that was predicted.

The counterfactual is computable here only because this is a model. In the real system it is not observable at all, which is the whole difficulty.

Verify it yourself:

```bash
pnpm eml run examples/the-forecast-triggered-its-own-refutation/the_forecast_triggered_its_own_refutation.eml
```
