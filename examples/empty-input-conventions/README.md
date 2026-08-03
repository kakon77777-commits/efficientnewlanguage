# Four empty answers are forced; the fifth has none

`empty_input_conventions.eml` checks each aggregate's empty-input answer against the law that forces it.

**What it exercises**: `sum([]) == 0` is not a convention someone chose.
It is the only value that keeps `f(xs + ys) == combine(f(xs), f(ys))`
true when one side is empty, and the program verifies that at every
split point rather than asserting it. The same argument fixes product,
`all` and `any` — vacuous truth is derived, not decided.

`max` has no identity element, so no empty answer satisfies the law.
Both common workarounds are measured against real data: starting from 0
is right on 1 of 3 datasets, starting from a large negative sentinel on
2 of 3. Both are correct on positive data, which is why they ship.

The consequence is one level up: a threshold check on an empty batch
reads `max([]) == 0`, concludes "nothing exceeded the threshold", and is
indistinguishable from a real, correct no.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  max_sentinel([]) = -1000000   <- also plausible

a threshold check on an empty batch:
  raising version:  cannot answer - the caller has to decide
  zero version:     False  (reads as 'nothing exceeded the threshold')
  sentinel version: False  (same conclusion, different reason)
...both of which are indistinguishable from a real, correct 'no'.

checks passed: 5/5
Four empty answers are forced by algebra. The fifth has none, so it must refuse.

sum([]) == 0 is not a convention someone chose - it is the only value that
keeps the fold associative, and the same argument fixes product, all and
any. max has no such value, which is exactly why returning one is a
decision disguised as a default: the caller who needed to know the batch
was empty is told a number instead.
```
