# Other became the largest category - and every item in it was filed correctly

`other_became_the_largest_category.eml` classifies both eras by the same scheme, so the growth of the catch-all is a fact about the arriving population rather than about drift.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: having an "other" is correct design. Without it the classifier either refuses items or forces them somewhere they do not belong. The named categories were chosen from the items that existed when the scheme was written; new kinds arrive, none of them is any named category, and each is correctly filed as other.

```
categories in the scheme : 4 named, plus other
```

```
era 1
  items : 10
    auth : 3
    billing : 3
    search : 2
    export : 2
    other : 0
    other as a share : 0%
```

```
era 2
  items : 24
    auth : 4
    billing : 4
    search : 3
    export : 2
    other : 11
    other as a share : 45%
```

```
the largest category in era 2
  largest named : auth at 4
  other         : 11
  other is larger than every named category
```

```
what is inside other, in era 2
  mobile-sync : 3
  webhooks : 3
  sso : 3
  api-limits : 2
  distinct kinds inside other : 4
  each of them would be a named category if the scheme were written today
```

```
questions the scheme can answer
  how many auth problems : yes, 4
  how many other problems : yes, 11
  which kind of other problem is growing : no - other has no structure
  share of the population that cannot be analysed : 45%
```

```
control - the same items under a scheme written today
  named categories : 8
  other : 0  (0%)
  every item lands in a named category, and every question is answerable
```

Every item in the catch-all was filed correctly. The scheme is a snapshot of what existed when it was written, and it is the only part of the system that nothing forces anyone to revisit.

The **control** reclassifies the same items under a scheme written today: other goes to zero and every question becomes answerable again.

Verify it yourself:

```bash
pnpm eml run examples/other-became-the-largest-category/other_became_the_largest_category.eml
```
