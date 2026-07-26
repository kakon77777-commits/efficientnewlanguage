# Substring search (all positions)

`substring_search.eml` slides a pattern along a text and collects **every**
match position, not just the first — e.g. `'aba' in 'abababa' -> [0, 2, 4]`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first pattern-matching case.

Advancing by one position after a hit — rather than by the pattern length
— is what makes **overlapping** matches findable. `"aba"` genuinely occurs
three times in `"abababa"` (at 0, 2 and 4) and `"ana"` twice in
`"banana"` (at 1 and 3); an implementation that skipped ahead by the
pattern length would report only two and one respectively, and would still
look plausible. Both overlapping samples exist to pin that down, alongside
the two empty-result cases (no match, and pattern longer than text).

Verify it yourself:

```bash
pnpm eml transpile examples/substring-search/substring_search.eml   # -> Python
pnpm eml run examples/substring-search/substring_search.eml         # -> 5 "pattern in text -> positions" lines
pnpm eml trace examples/substring-search/substring_search.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/substring-search/substring_search.eml   # -> OK (fixpoint)
```
