# Round-tripping and canonicality are different claims

`base_conversion_roundtrip.eml` encodes and decodes integers in every base from 2 to 16 and checks two separate properties.

**What it exercises**: `decode(encode(n)) == n` is the obvious one.
The one systems actually rely on is **canonicality** — that re-encoding
a decoded value gives back the same string — because that is what makes
an id safe to compare as a string, or to sign, or to use as a cache key.
`007` and `7` are the same number and not the same key.

Zero is the case that gets missed: the division loop never runs, so a
naive encoder returns the **empty string**, which round-trips fine
through any decoder whose accumulator starts at 0 and is never caught by
a test that starts at 1. Here the empty string is refused explicitly.

Swept over 300 (n, base) pairs plus malformed input and illegal bases.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

the empty string:
  encode(0, 10) = '0'
  decode('', 10) raises: empty string is not a number

malformed strings refused: 5/5
illegal bases refused:     3/3

checks passed: 5/5
Every pair round-trips, and the encoding is canonical - two separate claims.

Round-tripping and canonicality are different properties and the second is
the one systems actually rely on: an id compared as a string, a cache key, a
signature over a serialised number. `007` and `7` are the same number and
not the same key, and only the encoder can decide which of those a system
is allowed to see.
```
