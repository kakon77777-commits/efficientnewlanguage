# The ratio was stable and both sides were shrinking

`the_ratio_was_stable_and_both_sides_were_shrinking.eml` - Conversion rate held at 3.0 percent for twelve months. What held it there is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Conversion rate is the right primary metric for the team that owns the funnel, and it was chosen for good reasons. It is scale-free, so it is comparable across a quiet January and a busy November without anyone arguing about seasonality. It isolates the funnel from acquisition, which the funnel team does not control and should not be judged on. And it cannot be improved by buying traffic, which is exactly the gaming a raw purchase count invites.

A ratio holds when its two terms move together. It holds when both grow, and it holds when both shrink, and it reports the same number in both cases. What it cannot report is which of those happened.

The funnel team's metric was flat and correct for twelve months. Acquisition was a different team's metric, on a different dashboard, and it is not that either team was negligent - it is that no one owned the product of the two.

```
month    visits    purchases   conversion   revenue
  1       200000    6000        30 per mille   300000
  4       173000    5190        30 per mille   259500
  8       143000    4290        30 per mille   214500
  12       120000    3600        30 per mille   180000
```

```
  conversion in month 1  : 30 per mille
  conversion in month 12 : 30 per mille
  change                 : 0 per mille, across twelve consecutive months
```

```
visits  : 200000 -> 120000, down 40 percent
revenue : 300000 -> 180000, down 40 percent
ratio   : unchanged
```

```
the ratio was not lagging or noisy or slow to react
it was reporting, correctly, that the funnel converted as well as it ever did
```

```
worlds consistent with a flat conversion rate
  visits up, purchases up      growth
  visits flat, purchases flat  steady state
  visits down, purchases down  this one
  visits halved, purchases halved  the same reading again
  the dashboard cannot separate these, and it was never able to
```

```
  a ratio needs one of its terms shown beside it
  either term will do; the pair determines the third
  the funnel dashboard showed the ratio and the funnel stages
  every stage was also a ratio
```

```
control - the absolute counts, which no ratio can hold flat
  measurement points      : 4
  points where visits fell: 3 of 3 transitions
  visits lost             : 80000
  revenue lost            : 120000
  the decline is visible in every single reading of the raw count
```

```
null control - the same metric when only the numerator moves
  visits              : 200000, unchanged
  purchases           : 6000 -> 4200
  conversion          : 30 -> 21 per mille
  the ratio moved 9 per mille and would have paged
  so the metric works; it is blind only when both terms move together
```

```
what a scale-free metric gives up in exchange for being scale-free
  comparable across seasons        gained
  cannot be gamed by buying traffic gained
  isolates the team from acquisition gained
  detects a change in scale         given up, by construction
  the property that makes it fair is the property that makes it blind
```

Conversion rate is scale-free on purpose: it is comparable across seasons, it cannot be improved by buying traffic, and it does not judge the funnel team on acquisition. Being scale-free means a halving of both terms reads identically to no change at all. Visits fell 40 percent, revenue fell 40 percent, and the number the funnel team was accountable for did not move once.

Verify it yourself:

```bash
pnpm eml run examples/the-ratio-was-stable-and-both-sides-were-shrinking/the_ratio_was_stable_and_both_sides_were_shrinking.eml
```
