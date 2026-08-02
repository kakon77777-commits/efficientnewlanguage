# The fix that feels right and makes it worse

`run_length_escaping.eml` implements run-length encoding three ways, and the point is that the middle one - the obvious fix - is worse than the bug it was meant to repair.

**What it exercises**: naive RLE writes `a3b2c1`, and is unambiguous
until the data contains a digit. `"a3"` encodes to `"a131"`, which
decodes to `"a31"`. The data got shorter and the decoder returned
something plausible, because RLE has no error state.

Putting the count first - `3a2b1c` - feels like it fixes this, on the
theory that the parser then always knows where it is. That was this
file's own first premise. It is wrong: `"a3"` becomes `"1a13"`, and a
digit in the data still runs together with the next count.

The round trip over 92 generated strings is what disproved it. Naive
corrupts 42 of them; count-first corrupts or rejects **72** - the
intuitive fix measurably made things worse. Only the delimited form,
which puts an explicit boundary between count and character, round-trips
everything and refuses malformed input rather than decoding it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

strings the naive form corrupts:            42
strings count-first corrupts or rejects:    72

Malformed delimited input:
  a    -> expected a count at position 0
  3    -> expected a separator after the count at position 1
  12   -> expected a separator after the count at position 2
  3a   -> expected a separator after the count at position 1

Only the delimited codec round-trips everything. Both others break on digits.

Moving the count to the front FEELS like it fixes the ambiguity and does
not - it only changes where two numbers run together. That was this file's
own first premise, and the round trip over generated strings is what
disproved it. A format needs an explicit boundary, not a convention.
```
