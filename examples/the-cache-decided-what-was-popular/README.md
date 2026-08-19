# The cache decided what was popular

`the_cache_decided_what_was_popular.eml` - The cache holds the most requested items, and being held is part of why they are requested. Which items it settles on is simulated rather than assumed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Keeping the popular items is the right rule and the request counts it reads are real: those requests happened, they were served, and the count is not an estimate. Ranking by observed demand is what every cache does and it is correct as far as it goes.

A cached item answers quickly, and a quick answer gets used more - retried less, clicked through more, polled harder. So the count the cache ranks on is a count of demand plus a term the cache itself contributed. The ranking is over a quantity the ranking is an input to.

The fixed point is computed by running it.

```
items : 8, cache slots : 4
a cached item is requested 2x as often as the same item uncached
```

```
item   true demand
  a      100
  b      90
  c      80
  d      70
  e      60
  f      50
  g      40
  h      30
```

```
the true top 4 by demand alone : 
  a b c d 
```

```
round   cache contents
  0     e f g h 
  1     a b e f 
  2     a b e f 
  3     a b e f 
  4     a b e f 
  5     a b e f 
  6     a b e f 
  settled after round 2 and does not move again
```

```
the cache it settles on against the true top 4
  items in both      : 2 of 4
  held but not top   : 
    e, true demand 60
    f, true demand 50
  top but locked out : 
    c, true demand 80
    d, true demand 70
```

```
  c is observed at 80 against e at 120
  c is observed at 80 against f at 100
  d is observed at 70 against e at 120
  d is observed at 70 against f at 100
  the same pairs ranked on true demand alone
    c 80 beats e 60
    c 80 beats f 50
    d 70 beats e 60
    d 70 beats f 50
  every pair inverts once the boost is removed, so the boost is not a
  tiebreaker between close rivals - it is the whole of the ordering here
```

```
admitting the best uncached item for one round, repeatedly
  cache after 4 such rounds : a b c d 
  reaches the true top 4 after 2 admissions
```

```
control - the same rule where caching does not change demand
  items in both : 4 of 4
  the ranking lands on the true top immediately, from any starting cache
```

A ranking whose input it partly produces has fixed points, and this one has a wrong one two rounds away from any start. Two admissions leave it; nothing in the rule can reach it from inside.

Verify it yourself:

```bash
pnpm eml run examples/the-cache-decided-what-was-popular/the_cache_decided_what_was_popular.eml
```
