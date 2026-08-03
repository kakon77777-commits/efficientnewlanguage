# Three kinds of nothing, one falsy value

`absent_vs_empty_vs_zero.eml` merges a user config over defaults three ways and compares each against a separately stated intent.

**What it exercises**: absent, empty and zero are three different facts
about the world and one falsy value. A truthiness merge silently
overrides **exactly** the entries the user typed in order to say
something specific — a discount of 0, a label of "" — and gets the
non-falsy entry right, which is why it survives review.

Presence-based merging fixes both and still cannot express **removal**:
a user who wants no value at all has no way to say so, because absence
means "use the default". Only a tri-state with an explicit unset marker
can.

Checked against intent, not against each other — the merges are graded
by what a person reading the two files would say the answer should be.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  tri-state: discount=10 label='std' retries=3 note='#unset'
  tri-state marks it unset: True

the three values a reader has to tell apart:
  zero     present   truthy=False
  empty    present   truthy=False
  absent   absent    truthy=False
...all three are falsy, and only one of them means 'nobody said'.

checks passed: 5/5
Zero, empty and absent are one value to a truthiness test and three to a reader.

The truthy merge is right about every key a test fixture usually contains,
because fixtures are written with meaningful values. It is wrong exactly on
the entries a user typed in order to say something specific - zero, empty -
which are the ones the user cared enough about to set.
```
