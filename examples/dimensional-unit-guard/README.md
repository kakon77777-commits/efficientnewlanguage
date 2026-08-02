# A factor table will convert metres to seconds

`dimensional_unit_guard.eml` converts between units and refuses to convert between dimensions - which is the part a factor table cannot do.

**What it exercises**: a conversion table keyed by unit name will
happily multiply metres by a seconds factor. The arithmetic is correct,
the answer is a number, and it means nothing. What is missing is not
precision; it is that the operation was never defined.

The only place that can be said is at the boundary, before the multiply.
So every unit carries its dimension, and a conversion checks the
dimensions match first.

The checks are exhaustive over the table: all 34 same-dimension pairs
round-trip exactly, all 118 triples satisfy `a->b->c == a->c`, all 10
identities are unchanged, and all 66 cross-dimension pairs are refused -
66 being a count derived from the table rather than typed in.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
units:                        10
same-dimension pairs:         34
  round trips exact:          34/34
  identities unchanged:       10/10
triples within a dimension:   118
  a->b->c equals a->c:        118/118
cross-dimension pairs:        66 (table predicts 66)
  refused:                    66/66
unknown units refused:        3/3

Every legal conversion round-trips; every illegal one was refused.

A factor table alone will happily tell you that one metre is 3.28 seconds.
The arithmetic is correct and the answer is a number. What is missing is
not precision - it is that the operation was never defined, and the only
place that can be said is at the boundary, before the multiply.
```
