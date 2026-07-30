# Grouping into lists, not counters

`word_length_grouping.eml` buckets words by length — the other half of the
dict-as-accumulator pattern, where the values are lists that grow rather
than numbers that increment.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict whose values are lists, list growth by
concatenation, and two different orderings falling out of one guarantee.

```
length  count  members
------  -----  ------------------------------
3       2      fig, kiwi
5       2      apple, plum
6       2      cherry, banana
4       2      date, pear

Group sizes [2, 2, 2, 2] sum to 8 of 8 words
```

Two orderings are at work and they come from different places:

- **Group order** is the order each key was first needed. `3` comes first
  because `"fig"` was read first; `6` appears when `"cherry"` arrives.
- **Member order** within a group is simply read order.

Both are free consequences of insertion order — nothing is sorted anywhere
in the program.

The closing cross-check exists because grouping is easy to get subtly
wrong: if the sizes do not add back up to the number of words, an item was
dropped or double-counted.

Verify it yourself:

```bash
pnpm eml run examples/word-length-grouping/word_length_grouping.eml
pnpm eml trace examples/word-length-grouping/word_length_grouping.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/word-length-grouping/word_length_grouping.eml   # -> OK (fixpoint)
```
