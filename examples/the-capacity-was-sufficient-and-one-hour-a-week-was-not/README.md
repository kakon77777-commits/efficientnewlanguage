# The capacity was sufficient and one hour a week was not

`the_capacity_was_sufficient_and_one_hour_a_week_was_not.eml` - Capacity planning has shown comfortable headroom for fourteen months, and the planning is careful. What the headroom is an average over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The planning is done properly. Utilisation is measured on the containers that actually run rather than on the nodes they sit on; the figure includes the sidecars, which are usually forgotten; growth is projected from the last four quarters rather than from the best one; and a review that finds headroom below the floor triggers a purchase rather than a conversation.

Utilisation is the mean over the week.

```
cores provisioned               : 4800
mean utilisation                : 4100 per ten thousand
headroom floor                  : 5000 per ten thousand
months of comfortable headroom  : 14
```

```
hours in a week                 : 168
  above the floor               : 3
  below it                      : 165
peak utilisation                : 9800 per ten thousand
  distance from the mean        : 5700 per ten thousand
```

```
requests a week                 : 42000000
  in those three hours          : 1900000
  traffic in those hours        : 452 per ten thousand
requests shed in those hours    : 61000
  shed, over the week           : 14 per ten thousand
  shed, inside those hours      : 321 per ten thousand
```

```
capacity reviews a year
  that read the mean            : 4
  that read the peak            : 0
  that read only the mean       : 4
```

```
the capacity review
  what utilisation is measured on : the containers that
    run, not the nodes they sit on
  sidecars : included, which is the part usually
    forgotten
  growth : projected from four quarters, not the best
    one
  headroom below the floor : triggers a purchase, not a
    conversation
  months comfortable : 14
  verdict : SUFFICIENT
```

```
  counting the sidecars is the part almost nobody does,
  and it is why 4100 per ten thousand is not an
  understatement
```

```
the same week, two ways
  as a mean : 4100 per ten thousand, comfortably
    under the floor of 5000
  at its peak : 9800 per ten thousand
  the distance : 5700 per ten thousand
  hours spent up there : 3 of 168
  hours spent below : 165
```

```
  a hundred and sixty-five quiet hours are enough to
  average away three loud ones, and the three are when
  the work arrives
```

```
inside the peak
  traffic there : 452 per ten thousand of the week
  requests shed there : 61000
  shed as a share of the week : 
    14 per ten thousand
  shed as a share of those hours : 
    321 per ten thousand
  which of those two the capacity review reads : 
    neither; it reads the mean utilisation
  reviews that read the peak : 
    0
```

```
null control - apply the floor to the busiest hour
  mean utilisation : 4100, unchanged
  the hour the floor now reads : 
    9800 per ten thousand
  reviews that would have triggered a purchase : 
    1
  no container changed and no hour got busier; the
  statistic the floor is applied to stopped being the one
  the quiet hours dominate
```

```
what comfortable headroom guarantees
  mean utilisation is under the floor : exactly,
    measured on the containers, sidecars included,
    projected from four quarters, 14 months
  the system has enough capacity : not addressed; the
    mean is taken over 168 hours and the shedding
    happens in 3 of them
```

```
a mean is a statement about a period and none about any
moment in it; where demand is concentrated the average is
lowest exactly because most of the period is idle
```

Utilisation is measured on the containers with sidecars counted, growth comes from four quarters, and a breach buys hardware - 4100 per ten thousand against a floor of 5000, 14 months. It is a mean over 168 hours, so the 3 that reach 9800 shed 61000 requests - 321 per ten thousand of what arrives then and 14 per ten thousand of the week - across 0 reviews that read the peak.

Verify it yourself:

```bash
pnpm eml run examples/the-capacity-was-sufficient-and-one-hour-a-week-was-not/the_capacity_was_sufficient_and_one_hour_a_week_was_not.eml
```
