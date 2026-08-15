# Ranked by clicks, then shown first - locks in at 66% and never reaches 100%

`ranked_by_clicks_then_shown_first.eml` runs the ranker for five days over items whose quality is fixed, known to the program, and never read by the ranker.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: ranking by clicks is the honest choice available - nobody guesses what is good, no editor imposes taste, and the signal comes from the people the list is for. On the first day it works exactly as intended. From the second day the clicks it reads are clicks it caused.

```
items and their quality, which the ranker never reads
  a : 3
  b : 9
  c : 5
  d : 7
  e : 4
  f : 8
  best possible order : bfdcea  (100%)
```

```
day 0 - launch order : abcdef  (40%)
day 1 - badcef  (53%)
day 2 - bdacef  (60%)
day 3 - bdcaef  (66%)
day 4 - bdcaef  (66%)
day 5 - bdcaef  (66%)
```

```
  best possible : 100%
  reached       : 66%
```

```
the same item at each slot
  quality 5 at slot 1 : 50 clicks
  quality 5 at slot 2 : 30 clicks
  quality 5 at slot 3 : 20 clicks
  quality 5 at slot 4 : 15 clicks
  quality 5 at slot 5 : 10 clicks
  quality 5 at slot 6 : 5 clicks
```

```
the worst item at the top against the best at the bottom
  quality 3 at slot 1 : 30
  quality 9 at slot 6 : 9
  position outweighs a three-fold quality gap
```

```
control - every slot seen equally
  order : bfdcea  (100%)
  with position removed, clicks recover the quality order exactly
```

The ranker reads a real signal. After the first day that signal contains the ranker's own previous output, and nothing in a click count says which part is which.

The **control** removes position bias and nothing else: with every slot seen equally the same ranker recovers the quality order exactly, at 100%. So click ranking is not broken in general - it is broken when the clicks are also a record of where the ranker put things.

Verify it yourself:

```bash
pnpm eml run examples/ranked-by-clicks-then-shown-first/ranked_by_clicks_then_shown_first.eml
```
