# Vowel/consonant counter

`vowel_consonant_counter.eml` counts vowels, consonants, and spaces in the
sample sentence `"the quick brown fox jumps over the lazy dog"` and prints
a small report.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `for ch in sentence:` loop over a string, an
`if`/`elif`/`else` chain, `in` membership testing a character against a
literal vowel string (`ch in vowels`), the `^+` augment sigil incrementing
an already-declared bare counter (`space_count^+1`, a bare-literal RHS —
valid for `^+`), and `str()` + `+` concatenation to build each printed
report line. Every construct here executes natively in the interpreter
(no deferrals): `eml:equiv` compares interpreter output to real Python with
`ok:true` and the trace carries 0 anomalies.

Verify it yourself:

```bash
pnpm eml transpile examples/vowel-consonant-counter/vowel_consonant_counter.eml   # -> Python
pnpm eml run examples/vowel-consonant-counter/vowel_consonant_counter.eml         # -> vowel/consonant/space report
pnpm eml trace examples/vowel-consonant-counter/vowel_consonant_counter.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/vowel-consonant-counter/vowel_consonant_counter.eml   # -> OK (fixpoint)
```
