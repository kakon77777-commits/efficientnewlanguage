# The not in list had a null

`the_not_in_list_had_a_null.eml` - The query returns the accounts that are not on the block list, and the SQL is correct. What one NULL in that list does is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The query is careful. The block list comes from a real column, not a hard-coded array; the NOT IN is the database's own, not a hand-built loop; it runs over every account; and the intent is exactly 'accounts not blocked'.

One value in the block list is NULL, and `id NOT IN (..., NULL)` is UNKNOWN for every id.

```
accounts                        : 100000
blocked ids that are real       : 40
blocked ids that are null       : 1
```

```
accounts that should be allowed : 99960
accounts the query returned     : 0
  wrongly excluded              : 99960
wrongly excluded                : 10000 per ten thousand
```

```
the not-blocked query
  block list source : a real column, not a hard-coded
    array
  operator : the database's own NOT IN
  over : every account
  intent : accounts not on the block list
  hand-built loops that could differ : 0
  verdict : returns the allowed accounts
```

```
  using the engine's NOT IN rather than a hand-built loop
  is the part done right here, and it is why a real listed
  id is reliably excluded
```

```
id NOT IN (..., NULL)
  what NOT IN expands to : id <> a AND id <> b AND ... AND
    id <> NULL
  what id <> NULL yields : UNKNOWN
  what TRUE AND UNKNOWN yields : UNKNOWN
  so the whole predicate : UNKNOWN for every id
  rows a WHERE keeps when the predicate is UNKNOWN : none
```

```
the result of the not-blocked query
  accounts that should pass : 99960
  accounts returned : 0
  the one NULL responsible : a single null id in the list
  is the query wrong : no; NOT IN with a NULL is UNKNOWN
    by the standard
  did a whole feature return empty : yes, from one null
```

```
null control - drop the null before NOT IN (or NOT EXISTS)
  returned, null in the list : 0
  returned, null filtered out : 99960
  accounts it recovers : 99960
  no account and no block entry changed; the NULL stopped
  turning every comparison unknown
```

```
what a NOT IN block-list query guarantees
  no returned account equals a listed id : exactly, the
    engine's own NOT IN
  the allowed accounts are returned : not addressed; the
    list contains a NULL, and id NOT IN (..., NULL) is
    UNKNOWN for every id, so the query returns 0 of 
    99960 accounts that should have passed
```

```
NOT IN is a chain of not-equals joined by AND, and one not-equal against NULL
makes the whole chain unknown; the list that was meant to exclude a few ends up
excluding everything, from a single missing value in it
```

It uses the engine's NOT IN over a real block-list column for every account - correct SQL. One id in the list is NULL, so id NOT IN (..., NULL) is UNKNOWN for every row and the query returns 0 of 99960 allowed accounts, 10000 per ten thousand wrongly excluded.

Verify it yourself:

```bash
pnpm eml run examples/the-not-in-list-had-a-null/the_not_in_list_had_a_null.eml
```
