# Last touch vs first touch — four models, different winners, identical totals

`last_touch_vs_first_touch.eml` scores four channels under four attribution
models over eight conversions, computes each model's ranking, and reports how
far channels move.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: attribution is a modelling decision that arrives in the
codebase as a default.

| model | search | social | email | affiliate | total | winner |
| --- | --- | --- | --- | --- | --- | --- |
| first | 60 | **300** | 0 | 120 | 480 | social |
| last | 420 | 0 | 0 | 60 | 480 | search |
| linear | 210 | 75 | 135 | 60 | 480 | search |
| position | 288 | 84 | 54 | 54 | 480 | search |

**Every model distributes exactly 480 units.** The reconciliation everybody
runs — attributed credit equals conversions — passes 4/4. The disagreement
lives entirely in the split, and nothing sums the split.

```
first     social > search > email > affiliate
last      search > affiliate > social > email
linear    search > email > social > affiliate
position  search > social > email > affiliate
```

Two distinct winners; `social`, `email` and `affiliate` each move two rank
positions.

What the choice is worth, per channel:

```
search      between 60 and 420 units, a factor of 7.0
social      nothing to 300 units - one model gives it no credit at all
email       nothing to 135 units - one model gives it no credit at all
affiliate   between 54 and 60 units, a factor of 1.1
```

**A display bug caught while writing this**: the spread line originally printed
`hi / max(lo, 1)` and reported "a factor of 300" for a channel that goes from
**zero** to 300. That is not a factor of anything — it is the difference
between existing and not existing, and the output now says which one it is.

Verify it yourself:

```bash
pnpm eml run examples/last-touch-vs-first-touch/last_touch_vs_first_touch.eml
```
