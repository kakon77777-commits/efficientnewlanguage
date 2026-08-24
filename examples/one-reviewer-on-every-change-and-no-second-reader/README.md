# One reviewer on every change and no second reader

`one_reviewer_on_every_change_and_no_second_reader.eml` - One engineer reviews every change to a module. What that does to how many people can read it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: His reviews are the best on the team. He catches real defects, he explains why, and the module has not had a production incident in two years. Routing changes to the person most likely to catch something is a sensible rule and it is producing exactly the outcome it promises.

Reading code carefully is how anybody learns a module, and review is the only occasion on which most people read code they did not write. Routing every review to the person who already knows it removes the only mechanism by which a second person would come to know it. The rule optimises each review and spends the thing that would make the next one cheaper.

Changes are counted by who reviewed them and what each reviewer accumulated.

```
quarter   changes   reviewed by him   by others   others who can read it
  Q1        40        38                2           3
  Q2        44        43                1           3
  Q3        39        39                0           2
  Q4        47        47                0           2
  Q5        52        52                0           1
  Q6        49        49                0           1
```

```
changes across the period : 271
he reviewed               : 268, 98%
anyone else reviewed      : 3
people who can read it    : 3 -> 1
```

```
review concentration against readership
  Q1 : 95% of reviews to him, 3 others can read it
  Q2 : 97% of reviews to him, 3 others can read it
  Q3 : 100% of reviews to him, 2 others can read it
  Q4 : 100% of reviews to him, 2 others can read it
  Q5 : 100% of reviews to him, 1 others can read it
  Q6 : 100% of reviews to him, 1 others can read it
  concentration 95% -> 100%
  readership 3 -> 1
  the second number falls as the first rises, and the second number is not
  on any dashboard
```

```
reading time accumulated, by person
  him    : 804 hours across 268 changes
  others : 9 hours across 3 changes
  ratio  : 89 to 1
  a review is the only time most people read code they did not write, so
  this ratio is also the ratio of how much each side has learned
```

```
the routing rule: send it to whoever is most likely to catch something
  defects caught by him per 100 reviews    : 14
  defects caught by others per 100 reviews : 5
  so on the evidence available at routing time, the rule is right every
  single time it is applied
  and the evidence is a measurement of the gap the rule is widening
```

```
what happens when he is unavailable
  people who could review a change today : 1
  changes per quarter needing review     : 49
  hours of reading that person would need to catch up : 804
  the catch-up cost has grown every quarter and is not recorded anywhere
```

```
pairing a second reviewer onto a share of the changes
  10% of changes to a second reviewer : 4 changes a quarter, 12 hours of reading
  25% of changes to a second reviewer : 12 changes a quarter, 36 hours of reading
  50% of changes to a second reviewer : 24 changes a quarter, 72 hours of reading
  defects that would be missed, at the observed rates : 1 a quarter at the 25% share
  that is the cost, it is real, and it is the only one of these numbers
  the routing rule can see
```

```
control - billing adapter, review rotates
  changes a quarter : 46
  most any one reviewer took : 12, 26%
  people who can read it : 5
  its defect catch rate is lower per review than his, and the module has
  five people who could take it tomorrow
  the rotation costs catches and buys readers, and both are measured
```

His reviews are the best on the team and the module has been incident-free for two years. Review is how a second person would learn it, and 98% of them went to the person who already had.

Verify it yourself:

```bash
pnpm eml run examples/one-reviewer-on-every-change-and-no-second-reader/one_reviewer_on_every_change_and_no_second_reader.eml
```
