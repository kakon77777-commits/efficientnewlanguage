# Caesar cipher

`caesar_cipher.eml` encodes the sample message
`"Meet me at the old bridge at midnight"` with a fixed shift-7 Caesar
cipher, then decodes the result back to the original, printing all three
lines (original / encoded / decoded) to demonstrate the round trip.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: character-by-character string building via a `for ch
in message:` loop, `elif` chains with string range comparisons
(`ch >= "a" and ch <= "z"`) to classify lowercase/uppercase/other
characters, and shifting letters via a 26-letter lookup table plus a
linear scan for the source index, with floor-`%` wraparound for the shift
itself. **Verified empirically** that `ord(...)`/`chr(...)` are *not*
modeled by the in-browser interpreter — unlike `.upper()`/`.split()`-style
attribute calls (which the interpreter defers gracefully as
`eml:unsupported`), a bare `ord(...)`/`chr(...)` call falls through to the
interpreter's builtin dispatcher, which has no case for them and raises a
plain `NameError` (a genuine crash, not a graceful defer) — so this case
avoids them entirely via lookup-table indexing instead, staying fully
interpreter-computable end to end.

Verify it yourself:

```bash
pnpm eml transpile examples/caesar-cipher/caesar_cipher.eml   # -> Python
pnpm eml run examples/caesar-cipher/caesar_cipher.eml         # -> original/encoded/decoded lines
pnpm eml trace examples/caesar-cipher/caesar_cipher.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/caesar-cipher/caesar_cipher.eml   # -> OK (fixpoint)
```
