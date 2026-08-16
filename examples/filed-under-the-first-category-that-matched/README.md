# Filed under the first category that matched - every count ranges from 1 to 6 on rule order alone

`filed_under_the_first_category_that_matched.eml` runs the same items under all six orderings of the same three rules.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: checking rules in order is how every classifier of this kind works, and it has to stop somewhere because downstream wants one label. Each rule is correct about what it matches. What the order encodes is a precedence nobody wrote down, because it was never a decision - it is the sequence someone happened to type.

```
items : 10
  items matching more than one category : 7
```

```
the same items under every ordering of the same three rules
  security, performance, usability : security=6  performance=3  usability=1  
  security, usability, performance : security=6  performance=1  usability=3  
  performance, security, usability : security=3  performance=6  usability=1  
  performance, usability, security : security=1  performance=6  usability=3  
  usability, security, performance : security=3  performance=1  usability=6  
  usability, performance, security : security=1  performance=3  usability=6  
```

```
the range of each count, across the six orderings
  security : 1 to 6   (spread 5)
  performance : 1 to 6   (spread 5)
  usability : 1 to 6   (spread 5)
```

```
items whose label depends on the ordering
  t1
  t2
  t3
  t4
  t8
  t9
  t10
  count : 7 of 10
  exactly the items that match more than one rule
```

```
the headline under two orderings
  'our biggest category is security, at 6'
  'our biggest category is usability, at 6'
  same items, same rules, different sequence
```

```
control - items matching at most one rule
  items whose label depends on ordering : 0
  here the sequence carries nothing, and first-match is exact
```

Each rule is right about what it matches. The distribution is a fact about the sequence they were typed in, and the sequence is not in the taxonomy.

The **control** is items that match at most one rule: there the sequence carries nothing and first-match is exact. Order-dependence is not inherent to the technique - it appears exactly where the categories overlap.

Verify it yourself:

```bash
pnpm eml run examples/filed-under-the-first-category-that-matched/filed_under_the_first_category_that_matched.eml
```
