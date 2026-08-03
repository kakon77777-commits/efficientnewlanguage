# One character, three lengths

`text_length_is_three_numbers.eml` measures the same strings in code points, UTF-8 bytes and terminal columns.

**What it exercises**: a single han character is 1 code point, 3 bytes
and 2 columns. For ASCII all three agree — which is why a validator
written and tested in English is correct until the first non-English
input, and then a name that `len()` says fits is rejected by the
database three layers away from the check.

EML-P has no `.encode()`, so the byte length is derived from the code
point, which makes the rule visible: 1 byte below 0x80, 2 below 0x800,
3 below 0x10000. The rule is checked on both sides of every boundary.

Also measured: truncating to a byte budget by slicing characters leaves
the value over the limit. The output labels rows in ASCII rather than
printing the samples — the first version died on a cp950 Windows console
for a reason with nothing to do with the property being measured.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
ASCII samples where all three agree: 2/2
...which is why a validator tested in English is correct and wrong.

truncating a 3-character han string to fit 8 bytes:
  by character count (3 chars): 3 chars = 9 bytes   fits: False
  by byte budget:               2 chars = 6 bytes   fits: True

UTF-8 length rule checked at its boundaries: 7/7

checks passed: 5/5
One character, three lengths: 1 code point, 3 bytes, 2 columns.

The form validates code points, the column stores bytes, and the report
aligns columns - three checks in three units, each correct for its own
layer. Nothing is wrong until they are treated as the same number, which
they are for every value anyone tested with.
```
