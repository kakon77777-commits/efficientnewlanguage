# The return term arrives after the review

`the_return_term_arrives_after_the_review.eml` - Each change was reviewed two weeks after it shipped. What each one is worth at two weeks and at six months is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Reviewing at two weeks is the right cadence for most of what a team ships. The signal is there, the context is fresh, the people who made the decision are still on it, and a review held six months out is a review nobody attends and nothing acts on.

Some changes have a term that arrives later than the review: an index that has to be rebuilt, a queue that fills slowly, a dependency that is pinned now and unpinnable in a year. A cadence chosen for the common case reads those at the point where only their first term has landed.

Both horizons are computed for the same five changes.

```
changes : 5, reviewed at week 2, horizon week 26
```

```
change                  at week 2   at week 26   cost lands
  drop the extra index   16        208        never
  cache the join   24        52        week 10
  pin the dependency   10        130        week 40
  batch the writes   12        116        week 3
  denormalise the table   30        -130        week 14
```

```
best change by the review-week number : denormalise the table (30)
best change by the horizon number     : drop the extra index (208)
  different changes, and the review is what the next quarter copies
```

```
changes that look good at week 2 : 5 of 5
  of those, negative by week 26 : 1
    denormalise the table : 30 then -130
```

```
the last cost to land does so at week 40
  a review that saw every term would sit 38 weeks later than this one
  and would be held after the next 19 reviews had already happened
```

```
changes with a term still outstanding at the review : 4 of 5
  each of those is knowable at review time, because the cost is scheduled
  and not discovered; the review reads a number, not a forecast
```

```
control - three changes with no later term
  best at week 2 : b, best at week 26 : b
  the same change under both, so the cadence decides nothing here
```

Two weeks is the right cadence for the changes whose whole effect has landed by then, which is most of them. For the rest the review reads the first term of a sum, and the date it is held on is what selects which.

Verify it yourself:

```bash
pnpm eml run examples/the-return-term-arrives-after-the-review/the_return_term_arrives_after_the_review.eml
```
