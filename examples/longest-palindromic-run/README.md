# Longest palindrome: an off-by-one that produces a longer answer

`longest_palindromic_run.eml` finds the longest palindromic substring by expanding around every centre, and never trusts what it extracts.

**What it exercises**: expand-around-centre is standard, and its whole
difficulty is bookkeeping — 2n−1 centres rather than n, and a loop that
exits one step past the last valid window.

The classic error is extracting `s[l:r+1]` instead of `s[l+1:r]`. Both
are valid slices. The run shows the difference on `forgeeksskeegfor`:

```
correct    s[l+1:r]  = "geeksskeeg"    palindrome: True
off-by-one s[l:r+1]  = "rgeeksskeegf"  palindrome: False
```

The wrong one is **two characters longer**, so it wins the max
comparison and becomes the answer. That is why the check here is not
"did it find something long" but "is what it found actually a
palindrome" — re-verified from scratch on every candidate, and the
final answer cross-checked against a brute-force O(n³) scan that cannot
share a bug with the O(n²) method.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 13 lines)

```
  off-by-one s[l:r+1]     = "rgeeksskeegf"  palindrome: False
  the wrong one is longer: True

samples checked:                 8
two methods agree on length:     8/8
expansion result IS a palindrome: 8/8

Both methods agree, and every answer was re-verified as a palindrome.

An off-by-one at the end of an expansion produces a LONGER string, so it
wins the max comparison and becomes the answer. That is why the check here
is not 'did it find something long' but 'is what it found actually a
palindrome' - re-verified from scratch, on every single candidate.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`longest_palindromic_run.trace.jsonl` beside this file is the recorded execution.
