# Anagram checker

`anagram_checker.eml` checks five sample word pairs — `listen`/`silent`,
`evil`/`vile`, `dormitory`/`dirtyroom`, `night`/`thing`, and `cat`/`dog` —
for whether each pair is an anagram of the other.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuple literals in a list and tuple subscript read
(`pair[0]`, `pair[1]`), a manually-built per-letter frequency dict for each
word (a `for ch in word:` loop with `in` membership plus dict subscript
get/set — deliberately not a `collections.Counter` builtin), and a direct
dict-to-dict `==` comparison to decide the verdict. Re-declaring a dict
with `^+{}` fresh on every outer loop iteration works cleanly (each
iteration gets an empty accumulator). Every construct here runs natively
in the interpreter — no deferrals: `eml:equiv` reports `ok:true` against
real Python with 0 anomalies.

Verify it yourself:

```bash
pnpm eml transpile examples/anagram-checker/anagram_checker.eml   # -> Python
pnpm eml run examples/anagram-checker/anagram_checker.eml         # -> five anagram verdicts
pnpm eml trace examples/anagram-checker/anagram_checker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/anagram-checker/anagram_checker.eml   # -> OK (fixpoint)
```
