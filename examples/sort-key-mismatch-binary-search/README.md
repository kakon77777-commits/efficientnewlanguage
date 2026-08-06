# Sort key mismatch — the list is sorted, the item is in it, the search says no

`sort_key_mismatch_binary_search.eml` searches a case-insensitively sorted list
with a case-sensitive comparison and counts how many present items come back
"not found".

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: binary search does not require a sorted list. It
requires a list sorted **by the same comparison the search uses**. Those are
two different requirements and only the first is ever stated.

| search comparison | present items reported absent |
| --- | --- |
| case-sensitive (mismatched) | **5 of 7** |
| case-insensitive (matching) | 0 of 7 |

Both orderings are correct. A database collation sorted the list; the
application's own `<` searched it; neither knows about the other.

The precondition, stated as two counts: the list is in order under **its own**
comparison on 6/6 adjacent pairs, and under the **search's** comparison on
fewer. Every missed item is findable by a linear scan, so nothing is actually
absent — the search is answering a different question.

What happens next, in the calling code:

```
  records inserted for names already present: 5
  store size: 7 -> 12
```

The failure is not a crash and not a wrong item. It is a miss, so the caller
takes the create-if-absent branch and inserts a duplicate.

The final check is why this never reproduces locally: with **no mixed case
anywhere**, misses are 0 of 7 — which is what a hand-written fixture almost
always looks like.

Verify it yourself:

```bash
pnpm eml run examples/sort-key-mismatch-binary-search/sort_key_mismatch_binary_search.eml
```

```bash
pnpm eml trace examples/sort-key-mismatch-binary-search/sort_key_mismatch_binary_search.eml --run
```
