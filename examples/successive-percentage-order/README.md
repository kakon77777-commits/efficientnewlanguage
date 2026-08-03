# Three tiers of commuting, and only one is safe

`successive_percentage_order.eml` applies promotion stacks in every order over several prices and counts the distinct outcomes.

**What it exercises**: this file started from the premise that
percentages commute. In exact arithmetic they do. In money they do not —
on a 12.34 item, −10/−20/−25 gives 6.67 and −10/−25/−20 gives 6.66,
because rounding happens at every step and rounding commutes with
nothing. The clean algebraic fact survives until the first `int()`, on
**2 of 6** prices swept.

So there are three tiers. Flat amounts commute exactly. Percentages
commute in algebra and not after rounding. A mixed stack does not
commute at all — 6 distinct answers, a spread of 1.64 on a 12.34 item.

There is no right answer to the mixed stack; it is a pricing policy. The
defect is that a list and a loop answer it silently, so the policy ends
up being whatever order the rows came back in. Also measured: the
rounding rule itself changes the answer on 2 of 6 prices, and a
percentage down followed by the same percentage up never returns.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  percentages and a flat: 6

largest spread on a mixed stack: 1.64 on a 12.34 item

prices where rounding policy changes the answer: 2/6
total difference across them:                    0.02

checks passed: 5/5
Flats commute exactly, percentages only until rounding, mixtures not at all.

There is no right answer to the mixed stack - it is a pricing policy, not
arithmetic. The defect is that a list and a loop answer it silently, so the
policy ends up being whatever order the rows came back from the database.
And the tier above it is the one this file got wrong: percentages commute
in algebra and stop commuting the moment money forces a rounding step, on
2 of the 6 prices swept. An algebraic identity is not an implementation.
```
