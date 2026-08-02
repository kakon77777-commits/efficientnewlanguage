# The padding table is the whole specification

`base32_codec_padding.eml` is a hand-written Base32 codec, and the only hard part is how many `=` characters go on the end.

**What it exercises**: Base32 consumes five bytes and emits eight
characters, so a short final group has to be padded - and RFC 4648
specifies exactly how many data characters each remainder produces:
1, 2, 3, 4 bytes give 2, 4, 5, 7 characters. Those numbers are not
derivable by intuition.

The usual bug is padding to a multiple of 8 without computing that
count. The output is then the right **length** carrying the wrong
number of real characters, and a decoder that trusts the length returns
a value one byte off - silently, because nothing about it is malformed.

The property is checked over every length from 0 to 40: `decode(encode(b)) == b`,
the encoded length is always a multiple of 8, and the padding count
matches the table. Writing that table also caught a real defect in this
file: a full 5-byte group needs an entry too, and leaving it off made
the encoder crash on the first complete block.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  padding      6    4    3    1

demo lengths:            13
  round-tripped:         13/13
  length a multiple of 8:13/13
  padding count correct: 13/13
lengths 0..40 swept:     41
  round-tripped:         41/41
malformed inputs refused:3/3

Every length round-trips, and the padding matches RFC 4648 exactly.

The keep table [0, 2, 4, 5, 7] is the whole specification. Padding to a
multiple of 8 without it produces output of the right LENGTH carrying the
wrong number of real characters, and a decoder that trusts the length is
off by a byte with nothing malformed to notice.
```
