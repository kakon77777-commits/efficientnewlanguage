# The adoption was measured where there was no alternative

`the_adoption_was_measured_where_there_was_no_alternative.eml` - The new internal tool reports 96 percent adoption in its fourth quarter. What the number is measuring is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Measuring adoption is the right thing to do and this team did it honestly. The number is not inflated, nobody is counting a login as usage, and the denominator is every employee rather than a flattering subset. It rose every quarter, which is what a tool that is working should do, and it was reported without adjustment.

It was also the quarter in which the old tool was switched off for the last large group of users. Adoption counts the people using the tool, and a person with no alternative is counted the same as a person who chose it. The two are not distinguishable inside the number, and only one of them is evidence.

The population that can produce evidence is the population that still has a choice, and switching the old tool off is the act of shrinking it. The better the rollout goes, the fewer people remain who could tell you anything, so the number becomes most confident exactly as it becomes least informative.

```
the reported number
  employees                    : 1200
  using the new tool           : 1156
  adoption                     : 96 percent
```

```
the same people, split by whether they had a choice
  no alternative               : 1150, of whom 1150 use it, 100 percent
  still have the old tool      : 50, of whom 6 use it, 12 percent
  population that can disagree : 50, which is 4 percent of the company
```

```
model: adoption = cut off + (remainder x 12 percent), one free parameter
```

```
quarter   cut off   predicted   reported   difference
  Q1        0         12          9          3
  Q2        60        64          62         2
  Q3        90        91          91         0
  Q4        96        96          96         0
```

```
  largest error across four quarters : 3 points
  the switch-off schedule predicts the adoption curve, so the curve is
  evidence about the schedule and not about the tool
```

```
control - an optional tool, same quarter, same team, same measurement
  employees with a choice : 1200
  adopted                 : 852, 71 percent
  population that can disagree : 1200, 100 percent of the company
  a lower number carrying more information than the higher one
  the measurement method is not the problem, it is the same method
```

```
the two readings of the same quarter
  adoption as reported                 : 96 percent
  adoption among people who could leave : 12 percent
  employees that projects to            : 144 of 1200
  the reported figure and the projection differ by 84 points and are
  computed from the same four numbers
```

```
the satisfaction survey attached to the rollout
  sent to     : users of the new tool
  that is     : 1156 people, 1150 of whom have no alternative
  asks        : how well the tool meets your needs
  cannot ask  : whether you would use it if the old one existed
  the one group that can answer that is the group being switched off next
```

Adoption was measured honestly, on the whole company, and it rose every quarter. It counts a person with no alternative the same as a person who chose: 96 percent overall, 12 percent among the 50 who still have a choice, and the switch-off schedule predicts all four quarters within 3 points.

Verify it yourself:

```bash
pnpm eml run examples/the-adoption-was-measured-where-there-was-no-alternative/the_adoption_was_measured_where_there_was_no_alternative.eml
```
