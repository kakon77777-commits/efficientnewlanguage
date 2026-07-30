# Counting with a dict, in first-appearance order

`char_frequency_table.eml` tallies the characters of a phrase and prints a
bar chart.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the dict-as-accumulator idiom, iterating a string
character by character, and iterating the resulting dict to report.

```
char  count  bar
----  -----  ------------
'm'   1      #
'i'   5      #####
's'   4      ####
'p'   2      ##
' '   1      #
'r'   2      ##
...
Most frequent: 'i' (5 times)
Counts sum to 17, text length is 17 -> True
```

The table is in **first-appearance** order, not alphabetical and not by
frequency: `'m'` leads because it opens the phrase. That ordering is free —
it falls out of the dict's insertion order rather than requiring a sort.

Two things worth noting about the idiom:

- The accumulator is written as check-then-insert. `dict.setdefault` and
  `collections.Counter` are not modelled in EML-P, and writing it out makes
  the ordering guarantee visible in the source.
- The most-frequent search walks the dict rather than calling `max`, because
  `max` over a dict compares **keys**, not values.

The final line is a deliberate cross-check: the counts must add back up to
the length of the original text, or the tally is wrong.

Verify it yourself:

```bash
pnpm eml run examples/char-frequency-table/char_frequency_table.eml
pnpm eml trace examples/char-frequency-table/char_frequency_table.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/char-frequency-table/char_frequency_table.eml   # -> OK (fixpoint)
```
