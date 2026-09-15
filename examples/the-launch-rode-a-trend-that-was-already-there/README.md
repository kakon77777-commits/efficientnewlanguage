# The launch rode a trend that was already there

`the_launch_rode_a_trend_that_was_already_there.eml` - A feature launched in November and conversions rose 20 percent. The counts are real and the before-and-after is honest. Whether the feature caused the rise is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It counts real completed conversions, not estimates; it covers every session in the window; the rise is the honest after-minus-before; and the intent is exactly 'did the feature lift conversions'.

November is the seasonal upswing, and a same-period segment that never got the feature rose almost as much - the pre/post comparison straddles a boundary the season had already crossed.

```
conversions before (October)    : 1000
conversions after (November)    : 1200
control segment before          : 1000
control segment after           : 1170
```

```
rise claimed for the feature    : 200
rise in the untouched control   : 170
left for the feature            : 30
seasonal share of the claim     : 8500 per ten thousand
```

```
the conversion measurement
  counts : real completed conversions, not estimates
  covers : every session in the window
  rise : the honest after minus before
  intent : did the feature lift conversions
  sessions omitted : 0
  verdict : CONVERSIONS ROSE 200 AFTER LAUNCH
```

```
  counting real conversions over every session is the part
  done right here, and it is why the rise of 200 is a true
  number about the post-launch window
```

```
the season the launch landed in
  what November is : the holiday upswing, rising anyway
  the untouched control, same window : rose from 1000 to
    1170 with no feature
  what pre/post compares : two windows on opposite sides of
    that upswing
  what it cannot separate : the feature from the calendar
  so the rise it attributes : is the feature plus the
    season, read as feature alone
```

```
the conclusion drawn
  feature lifted conversions by : 200
  the concurrent control's rise, no feature : 170
  actually attributable to the feature : 30
  are the counts wrong : no; conversions really rose 200
  is 200 the feature's effect : no; 8500 per ten
    thousand of it is the season
```

```
null control - difference-in-differences vs a concurrent control
  rise by raw pre/post : 200
  rise by difference-in-differences : 30
  seasonal rise the control removes : 170
  no session and no conversion changed; the rise stopped
  being read across the season and started being read
  against what the season did on its own
```

```
what a pre/post conversion lift guarantees
  conversions rose by the measured amount : exactly, real
    counts, every session, honest subtraction
  the feature caused the rise : not addressed; November is
    the seasonal upswing and a concurrent untouched control
    rose 170 of the 200 on its own, so pre/post credits
    the calendar to the feature
```

```
a before-and-after across a moving trend measures the trend as well as the
change; without a concurrent control the two are added together, and the season
the launch happened to fall in is counted as though the launch had made it
```

It counts real conversions over every session with an honest pre/post - the rise of 200 is true. But the launch fell on the November upswing, and a concurrent control with no feature rose 170; difference-in-differences leaves 30 for the feature, 8500 per ten thousand of the claim being the season.

Verify it yourself:

```bash
pnpm eml run examples/the-launch-rode-a-trend-that-was-already-there/the_launch_rode_a_trend_that_was_already_there.eml
```
