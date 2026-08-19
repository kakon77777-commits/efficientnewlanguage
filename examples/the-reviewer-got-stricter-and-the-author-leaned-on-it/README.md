# The reviewer got stricter and the author leaned on it

`the_reviewer_got_stricter_and_the_author_leaned_on_it.eml` - Review got stricter because defects were escaping, and self-checking got lighter because review was catching things. Where the pair settles is simulated.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both adjustments are correct responses to correct evidence. The reviewer saw defects reach production and looked harder, which found more. The author saw review catching things reliably and spent the pre-submit hour on the next change instead, which is what a working review process is for.

Effort spent by one party is evidence for the other party about how much to spend. Neither is optimising the pair, and neither can see the other's number, so the total lands wherever the two adjustments meet.

Ten rounds are run and every quantity is computed from the pair.

```
a change carries 20 latent defects before any effort
author effort removes 1 each; review effort catches 2 each
```

```
round   author   reviewer   caught   escaped   review days
  1       6        2          4        10         2
  2       6        3          6        8         3
  3       5        4          8        7         4
  4       4        5          10        6         5
  5       3        6          12        5         6
  6       2        7          14        4         7
```

```
where it settles
  author effort   : 6 at the start, 0 at the end
  reviewer effort : 2 at the start, 9 at the end
  effort per change, start : 8
  effort per change, end   : 9
  the pair spends 1 more than it started with
```

```
escaped defects, over 12 rounds : 53
  author effort spent   : 27
  reviewer effort spent : 80
```

```
the same budget of 9, split every possible way
  best split : author 0, reviewer 9, escaping 2
  where it settled : author 0, reviewer 9, escaping 2
  the two coincide: mutual adjustment landed on the efficient split,
  which it should, because review effort here is twice as productive
  as author effort and the pair kept moving until that showed
```

```
escapes if the efficient split had been chosen on the first day
  2 per round over 12 rounds : 24
escapes actually incurred : 53
  the difference is 29, which is what discovering the split by
  mutual adjustment cost, at 120% on top
  neither party could have named the split earlier: it depends on both
  productivities, and each of them knows only its own
```

```
each party reading only its own instrument
  the reviewer sees : defects it catches, which rose
  the author sees   : defects it is told about, which rose
  both read a rising number as evidence their own adjustment was right
  neither reads 53, the count that reached production
```

```
control - the author is never told what review caught
  author effort at the end   : 6
  reviewer effort at the end : 6
  unchanged, because the signal it was responding to was the other party
```

Two parties each adjusting on their own signal reached the split neither could compute, one increment at a time. What the search cost is the defects that escaped while it was still searching.

Verify it yourself:

```bash
pnpm eml run examples/the-reviewer-got-stricter-and-the-author-leaned-on-it/the_reviewer_got_stricter_and_the_author_leaned_on_it.eml
```
