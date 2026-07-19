# Word capitalizer

`word_capitalizer.eml` title-cases the sample sentence
`"the quick brown fox jumps over the lazy dog"` into
`"The Quick Brown Fox Jumps Over The Lazy Dog"` without using a
`.title()`/`.capitalize()` builtin.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `.split(" ")`/`" ".join(...)`/`.upper()` are all
attribute calls the in-browser interpreter genuinely defers — verified
empirically — so this case avoids them entirely and stays fully
interpreter-computable: a manual character scan tokenizes the sentence
(growing a list via `existing + [item] => existing`, the same idiom
[`examples/simple-stack/`](../simple-stack/) and
[`examples/prime-checker/`](../prime-checker/) use in place of
`.append()`), a 26-letter lookup table (`LOWER`/`UPPER`) uppercases just
the first character of each word via a linear scan, and a manual loop
rejoins the words with single spaces.

Verify it yourself:

```bash
pnpm eml transpile examples/word-capitalizer/word_capitalizer.eml   # -> Python
pnpm eml run examples/word-capitalizer/word_capitalizer.eml         # -> title-cased sentence
pnpm eml trace examples/word-capitalizer/word_capitalizer.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/word-capitalizer/word_capitalizer.eml   # -> OK (fixpoint)
```
