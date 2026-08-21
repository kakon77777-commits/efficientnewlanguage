# The fix shipped to the users who stayed

`the_fix_shipped_to_the_users_who_stayed.eml` - The fix went out eleven months after the bug. How many of the affected users were still there to receive it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Fixing it was right and shipping it was right. The bug was real, the fix is correct, and the users who have it now are better off than they were. Nothing about the work is wasted on the people it reached.

Who it reached is a different set from who it was about. Eleven months is long enough for the affected population to have changed, and the users most hurt by the bug are the ones most likely to have left - so the fix arrives at the people who tolerated it.

Both populations are counted from the same cohort.

```
users affected when the bug was reported : 5400
months until the fix shipped : 11
still using the product when it shipped : 4302
  which is 79%
```

```
severity            affected   churn/1000/mo   still here   retained
  blocked entirely   400        90              146        36%
  slow and annoying   1800        35              1222        67%
  cosmetic   3200        8              2934        91%
```

```
retention by severity
  lowest retention  : blocked entirely at 36%
  highest retention : cosmetic at 91%
  the users the bug hurt most are the ones least likely to be there
```

```
composition of the affected group, then and now
  blocked entirely : 7% of affected then, 3% of the reached now
  slow and annoying : 33% of affected then, 28% of the reached now
  cosmetic : 59% of affected then, 68% of the reached now
  the fix is aimed at a group whose worst-hit part has thinned out
```

```
reports per month, if 20 per 1000 present users report
  month 1  : 108
  month 11 : 84
  down 22%, with no change to the software
  a decline in reports is what a fix looks like and also what leaving
  looks like
```

```
what shipping it achieves
  users who stop hitting it : 4302
  users it was reported for  : 5400
  users who left while it was open : 1098
  the first number is real and is the case for shipping it; the third is
  the cost of the eleven months and is not recovered by shipping
```

```
control - the same cohorts with a one-week fix
  affected : 5400, still here after a week : 5370
  over 95% retained, so the fix reaches essentially the reported group
```

The fix is correct and the users who have it are better off. Eleven months is long enough for the population to turn over, and it turns over fastest among the people the bug hurt most.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-shipped-to-the-users-who-stayed/the_fix_shipped_to_the_users_who_stayed.eml
```
