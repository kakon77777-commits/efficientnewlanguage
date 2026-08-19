# One interval cannot see which way it feeds back

`one_interval_cannot_see_which_way_it_feeds_back.eml` - Two systems take the same shock and respond identically in the first interval. Which of them is amplifying is not in that interval, and is computed here.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Reading the first interval is not a mistake. It is the only interval anybody has when the decision is due, the response in it is real, and its size is measured correctly. Waiting for a second one has a cost, sometimes a large one.

What a single interval contains is the size of a response. Whether the next response will be larger or smaller is a fact about the sign of the loop, and a difference between two responses needs two of them to exist at all.

Both systems are run from the same shock over the same intervals.

```
both systems sit at 100 and take a shock of 40
```

```
interval   amplifying   damping
  1          140          140
  2          150          130
  3          162          123
  4          177          118
  5          196          114
  6          220          111
  7          250          109
  8          287          107
```

```
at interval 1 the two are identical at 140
  a reader with one interval has the size of the response and nothing else
```

```
they first differ at interval 2, by 20
```

```
by interval 8
  amplifying : 287, which is 187 above rest
  damping    : 107, which is 7 above rest
```

```
the step from interval 1 to interval 2
  amplifying : 10
  damping    : -10
  opposite signs, so two intervals separate them and one does not
```

```
adding capacity at interval 1 for the observed excess of 40
  if the system is damping    : the excess is gone by interval 8, leaving
    33 of the added capacity idle
  if the system is amplifying : the excess reaches 187, so the addition is
    short by 147
  the two errors are different sizes, so the cheaper guess is not the safer
  one and the choice is not symmetric
```

```
control - a system that returns to 100 immediately after the shock
  interval 1 : 140, interval 2 : 100
  interval 1 matches both of the others exactly
  three different systems, one first interval, and the decision is due
```

The first interval is measured correctly and it is what there is. The sign of a loop lives in the difference between two responses, and one response has no difference in it.

Verify it yourself:

```bash
pnpm eml run examples/one-interval-cannot-see-which-way-it-feeds-back/one_interval_cannot_see_which_way_it_feeds_back.eml
```
