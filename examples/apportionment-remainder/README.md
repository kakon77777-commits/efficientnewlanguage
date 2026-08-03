# Every part rounded correctly, and the total is wrong

`apportionment_remainder.eml` allocates a whole across shares three ways and checks that the parts sum back to the whole.

**What it exercises**: rounding each share independently is not a
rounding error — every part **is** the correctly rounded value of its
own share, verified for all of them. The defect exists only in the sum,
which is a property no single decision owns, so reviewing the parts one
at a time finds nothing.

Largest remainder always sums correctly by construction, and its cost is
reported: splitting 100 three equal ways gives 34/33/33, exact and
unequal, with the extra unit going to whoever is listed first. It
converts "the parts do not add up" into "the parts add up and one of
them is arbitrary" — a strictly better problem and not the same as no
problem.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
100 split three equal ways: 34,33,33
distinct amounts:           2
...the sum is exact and the recipients are not equal.
Whoever is listed first gets the extra unit. That is the tie rule, not the data.

individually correct roundings: 34/34
share vectors whose SUM is wrong: 5/8

checks passed: 5/5
Every part rounded correctly, and the total is wrong. The constraint is global.

Reviewing the parts one at a time finds nothing, because every part IS
correctly rounded. The defect exists only in the sum, which is a property
no single decision owns - and largest remainder does not remove the
difficulty so much as move it somewhere a person can see it: the total is
now exact and one recipient was chosen by the tie rule.
```
