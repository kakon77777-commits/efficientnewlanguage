# Hamming distance

`hamming_distance.eml` counts how many positions two equal-length strings
differ in, for five sample pairs — including the classic
`'karolin' vs 'kathrin' : 3`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a deliberate counterpart to
[`examples/edit-distance/`](../edit-distance/) — the same question shape
under far stricter rules. Hamming counts only substitutions and refuses
unequal lengths outright; Levenshtein also allows insertions and
deletions.

The `'flaw'`/`'lawn'` pair appears in **both** cases, and they disagree:

| Metric | `flaw` -> `lawn` |
| --- | --- |
| Hamming (this case) | **4** — every position differs |
| Levenshtein (`edit-distance`) | **2** — delete `f`, insert `n` |

Cost is part of the contrast too: this is one pass and a counter, where
edit distance needs a full `(n+1) x (m+1)` table. Stricter rules buy a
much cheaper algorithm.

Unequal lengths return `-1` and are reported as "undefined" rather than
silently compared up to the shorter length, which would quietly produce a
meaningless number.

Verify it yourself:

```bash
pnpm eml transpile examples/hamming-distance/hamming_distance.eml   # -> Python
pnpm eml run examples/hamming-distance/hamming_distance.eml         # -> 5 "'a' vs 'b' : n" lines
pnpm eml trace examples/hamming-distance/hamming_distance.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/hamming-distance/hamming_distance.eml   # -> OK (fixpoint)
```
