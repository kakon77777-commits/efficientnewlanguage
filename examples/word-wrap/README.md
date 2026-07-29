# Greedy word wrap

`word_wrap.eml` implements the algorithm behind every terminal that
reflows text, using the string tools EML actually has.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

```
+------------------------+
|the quick brown fox     |
|jumps over the lazy dog |
|while a                 |
|supercalifragilistic    |
|word waits              |
+------------------------+
```

**What it exercises**: the rule is simple — put a word on the current
line if it fits, otherwise start a new one — and "if it fits" is easy to
get wrong by exactly one character. An off-by-one here is invisible in
casual reading, because the paragraph still looks like a paragraph.

So the checks run over **every width from 8 to 40**, not the one width in
the demo:

```
  widths checked:            33
  no over-long line:         33
  words preserved in order:  33
  unavoidable overflows:     12 (a single word longer than the width)
```

**Two properties, and the second is the one people forget.** A wrap that
silently dropped the last word of each line would satisfy "no line
exceeds the width" perfectly. Only re-splitting the output and comparing
the word sequence against the input catches that.

The 12 unavoidable overflows are exactly widths 8–19, where
`supercalifragilistic` (20 characters) cannot fit on any line. Counting
those separately — rather than loosening the check until it passed — is
the difference between a real property and a decorative one.

Verify it yourself:

```bash
pnpm eml transpile examples/word-wrap/word_wrap.eml
pnpm eml run examples/word-wrap/word_wrap.eml         # -> the wrap, then 33/33 on both properties
pnpm eml trace examples/word-wrap/word_wrap.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/word-wrap/word_wrap.eml   # -> OK (fixpoint)
```
