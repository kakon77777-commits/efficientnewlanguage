# Three keys that are one key

`dict_key_identity_collapse.eml` is about `{1: "int", 1.0: "float", True: "bool"}` having one entry, and the asymmetry that makes it hard to see.

**What it exercises**: Python hashes by value, and `1`, `1.0` and
`True` are the same value. A counter keyed on mixed numeric types
silently merges buckets the author believed were separate.

The asymmetry is the part worth knowing: the surviving **key** is the
one inserted first, while the **value** is the one written last. So the
dictionary reads back a plausible value under all three literals, and
only the entry count says two of them were never stored.

The rule is also narrower than it looks - `"1"` and `(1,)` are distinct
keys, so it is not "anything numeric-looking collides" but exactly
"equal values with equal hashes collide". The fix is measured rather
than asserted: tagging each key by type first gives 9 buckets where the
naive dictionary gives 5, and both account for all 9 readings.

EML-P has no `type()`, so the tag is established by what a value can do -
which is itself a small demonstration of the language's boundary.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
1, "1" and (1,) as keys:
  entries: 3  - equal VALUE is the rule, not equal appearance

readings: [1, 1.0, True, 2, 2.0, '1', 3, False, 0]
  naive dictionary buckets:      5
  type-tagged buckets:           9
  readings counted, naive:       9
  readings counted, type-tagged: 9

checks passed: 6/6
Equal values share a key; the first insertion keeps it; tagging separates them.

The surviving key is the one inserted FIRST while the value is the one
written LAST. That asymmetry is what makes the merge hard to see: the
dictionary still reads back a plausible value under every one of the three
literals, and only the entry count says two of them were never stored.
```
