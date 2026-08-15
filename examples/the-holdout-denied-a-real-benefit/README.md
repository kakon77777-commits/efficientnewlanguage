# The holdout denied a real benefit - 320 in the good world, 2200 saved in the bad one

`the_holdout_denied_a_real_benefit.eml` runs both worlds to completion and prints them side by side. No probability is assumed anywhere.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the four cases before this one all end with the same recommendation, so this one measures what that recommendation costs. A holdout's price is not overhead - it is paid in exactly the currency the change was supposed to produce, by real users kept away from something good.

```
population 100, holdout 20, 6 periods, decision after 2
```

```
WORLD GOOD - the change is worth 8 per unit per period
  rolled out to everyone : 4800
  with the holdout       : 4480
  difference             : -320
```

```
WORLD BAD - the change costs 5 per unit per period
  rolled out to everyone : -3000
  with the holdout       : -800
  difference             : 2200
```

```
  the holdout costs  320 in the world where the change is good
  the holdout saves  2200 in the world where it is bad
  the saving is larger than the cost, and which world you are in is the
  thing nobody knows at the moment of choosing
```

```
the cost in the good world, decomposed
  units held back        : 20
  periods held back      : 2
  benefit denied to them : 320
  and that is the entire cost - the holdout delays nothing for anyone else
```

```
cost in the good world, by holdout size (deciding after 2)
  size 5 : 80
  size 10 : 160
  size 20 : 320
  size 40 : 640
```

```
cost in the good world, by how long you wait (holdout 20)
  1 periods : 160
  2 periods : 320
  3 periods : 480
  4 periods : 640
```

```
a holdout of 5 that cannot separate the two worlds
  its cost in the good world : 80
  what it buys               : nothing, because it does not decide
  full rollout would cost    : 0 in the good world, 3000 in the bad one
  so it is worse than rolling out AND worse than a holdout that works
```

Weighing the two worlds is the reader's judgement and not a fact this program has, so both are computed in full and neither is discounted.

The last block is the one worth keeping: a holdout too small to decide **costs its price and buys nothing**, which makes it strictly worse than rolling out and strictly worse than a holdout that works. Cutting the holdout to cut the cost is only a saving if the smaller one still answers - and [the-holdout-shrank-until-it-could-not-decide](../the-holdout-shrank-until-it-could-not-decide/) measures when it does.

Verify it yourself:

```bash
pnpm eml run examples/the-holdout-denied-a-real-benefit/the_holdout_denied_a_real_benefit.eml
```
