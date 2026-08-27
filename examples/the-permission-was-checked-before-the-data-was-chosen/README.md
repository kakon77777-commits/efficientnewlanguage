# The permission was checked before the data was chosen

`the_permission_was_checked_before_the_data_was_chosen.eml` - A search returns the ten highest-scoring documents a user is allowed to see. The user reports that the page is nearly empty. How many results each ordering produces is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Filtering after the query is a deliberate and defensible design. The permission rule is not expressible in the search index: it depends on group membership, on a per-document ACL, and on a delegation table that lives in a different service. Pushing it into the index would mean replicating three sources of truth into the search cluster and reindexing every document whenever anyone changes teams. Applying it in the application layer keeps one copy of the rule, in the service that owns it, and it cannot go stale.

The index returns the top ten by score. The application then removes the ones the user cannot see. The ten it removes from are the ten highest-scoring documents in the corpus, not the ten highest-scoring documents the user can see, and the second set is what was asked for.

The two orderings agree only when the user can see everything.

```
documents in the corpus      : 10000
this user may see            : 1200, which is 12 percent
page size                    : 10
```

```
rank, then filter
  documents fetched by score : 10
  of those, visible to user  : 1
  results on the page        : 1
```

```
filter, then rank
  documents in scope         : 1200
  taken by score             : 10
  results on the page        : 10
```

```
  same corpus, same scores, same permission rule
  1 results against 10
```

```
to fill a single page of 10
  ranks that must be fetched : 83
  ranks actually fetched     : 10
  short by                   : 73 ranks
```

```
page   ranks fetched   visible on it   running total
  1      1 to 10         1               1
  2      11 to 20         1               2
  3      21 to 30         1               3
  4      31 to 40         1               4
  5      41 to 50         2               6
```

```
  after 50 ranks the user has seen 6 of the 10 they asked for
```

```
which documents the user does not get
  removal is by permission, which is uncorrelated with score
  so the rank-1 document is removed with the same 88 percent chance as any
  other, and the survivors are a uniform sample of the global top 10
  the user does not get the best 1 document they can see
  they get whichever of the global top 10 they happen to be allowed,
  and the best document they CAN see may be at rank 83 or beyond
  so the page is not 'the best 1 they can see'
  it is 'whichever of the global top 10 they can see', which is a
  different and much smaller set
```

```
control - does either ordering leak a document
  documents shown that the user may not see, rank-then-filter : 0
  documents shown that the user may not see, filter-then-rank : 0
  the two orderings are identical on the property that was reviewed
  they differ only on the property nobody stated: completeness
```

```
  a filter is correct if it removes exactly the right things
  a filter applied at the wrong point is still correct by that definition
```

```
null control - the same code for a user who may see everything
  visible to user      : 10000 of 10000
  rank-then-filter     : 10 results
  filter-then-rank     : 10 results
  difference           : 0
  identical output, and the developer account is this account
```

```
visible share   results on a page of 10
  100 percent          10
  50 percent          5
  25 percent          2
  12 percent          1
  5 percent          0
  1 percent          0
```

```
  the page empties smoothly, so there is no threshold at which it breaks
  the most restricted users see the fewest results and are the least likely
  to be the ones testing it
```

Keeping the permission rule in the service that owns it is right: the rule reads three sources that the search index does not hold, and pushing it into the index would mean reindexing every document whenever anyone changes teams. Applying it after the ranking rather than before turns 'the best 10 you can see' into 'whichever of the global best 10 you can see', which for this user is 1 results, and filling one page would take 83 ranks.

Verify it yourself:

```bash
pnpm eml run examples/the-permission-was-checked-before-the-data-was-chosen/the_permission_was_checked_before_the_data_was_chosen.eml
```
