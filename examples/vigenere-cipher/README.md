# Vigenère cipher

`vigenere_cipher.eml` encodes `"attack at dawn"` with the key `"lemon"` to
`"lxfopv ef rnhr"`, then decodes it back — the textbook example, letter
for letter.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a **polyalphabetic** counterpart to
[`examples/caesar-cipher/`](../caesar-cipher/). Instead of one fixed shift
for the whole message, a repeating keyword supplies a different shift per
letter — and the output shows why that matters:

```
attack at dawn
lxfopv ef rnhr
```

`a` occurs four times in the plaintext and encodes to **four different
letters** (`l`, `o`, `e`, `n`), because each meets a different position of
the key. A single-shift Caesar cipher cannot do that, which is exactly why
simple letter-frequency analysis does not break this one.

Two implementation details:

- Character positions come from a 26-letter lookup table plus a linear
  scan, borrowed from the Caesar case, because `ord`/`chr` crash with a
  raw `NameError` in the browser interpreter rather than gracefully
  deferring — so this design keeps the program interpreter-computable end
  to end, and therefore covered by the `eml:equiv` gate.
- The key advances **only on letters**. A space that consumed a key
  position would desynchronise the key and make decoding produce garbage;
  the round-trip line at the end is what would catch that.

Verify it yourself:

```bash
pnpm eml transpile examples/vigenere-cipher/vigenere_cipher.eml   # -> Python
pnpm eml run examples/vigenere-cipher/vigenere_cipher.eml         # -> key, original, encoded, decoded, round-trip check
pnpm eml trace examples/vigenere-cipher/vigenere_cipher.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/vigenere-cipher/vigenere_cipher.eml   # -> OK (fixpoint)
```
