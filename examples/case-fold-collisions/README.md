# Two ways to lose a user, one of them silent

`case_fold_collisions.eml` folds usernames for uniqueness three ways and measures each against a separately stated ground truth about who is who.

**What it exercises**: "usernames are case-insensitive" is a product
decision; implementing it as a fold makes it a claim about a many-to-one
mapping, and the same fold applied to things never meant to be merged
merges them invisibly.

The measurement needs a truth that is not derived from any fold —
otherwise it would be describing the fold rather than the people. With
10 distinct people: plain lower-case gives 13 keys (3 **splits**),
lower+strip gives 9 (2 **merges**), and lower+strip+digits gives 5 (7
merges).

The two failure modes cost different things and are usually discussed as
one. A split is a support ticket: someone cannot log in and says so. A
merge is silent on both sides — the second person never gets an account
and the first never learns why their name was taken. Making the fold
more aggressive trades the loud failure for the quiet one.

EML-P has no `.lower()`, so the mapping is written out as a table, which
turns out to help: it makes visible that a fold *is* a table, and a
table is exactly the thing that can be many-to-one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  person 6: 'bob.smith' and 'bobsmith' are different keys for the same account
  person 8: 'carol7' and 'carol_7' are different keys for the same account

distinct people:            10
keys under lower:           13  (merged 0, split 3)
keys under strip:           9  (merged 2, split 0)
keys under strip+digits:    5  (merged 7, split 0)

checks passed: 5/5
Every fold either loses an account or loses a person. None is a uniqueness key.

The two failure modes cost different things and are usually discussed as
one. A SPLIT is a support ticket: someone cannot log in, they say so, it
gets fixed. A MERGE is silent on both sides - the second person simply
never gets an account, and the first never learns why their name was taken.
Making the fold more aggressive trades the loud failure for the quiet one.
```
