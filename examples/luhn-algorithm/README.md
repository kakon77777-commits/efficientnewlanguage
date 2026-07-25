# Luhn algorithm

`luhn_algorithm.eml` validates five numbers with the Luhn check-digit
algorithm — the checksum behind credit-card and IMEI numbers.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **check-digit / validation**
algorithm — an integrity check rather than a computation. Right-to-left
indexing (`digits[n - 1 - i]`), doubling every second digit with the
"subtract 9 if over 9" fold, and a `total % 10 == 0` verdict.

The sample set is chosen so the result is checkable by hand, not just
self-consistent: `79927398713` is the classic worked example (digit sum
70, valid), and `79927398714` is the same number with only the check digit
changed (sum 71, invalid) — so the case would fail loudly if the doubling
step were wrong. `4539148803436467` is a widely-published valid test
number, and `[0, 0]` covers the all-zeros edge case.

Digits arrive pre-split into lists rather than parsed from a string:
splitting a string and converting each character to an int is
interpreter-deferred, and any deferred construct makes a case **skip** the
`eml:equiv` execution-truth gate instead of passing it.

Verify it yourself:

```bash
pnpm eml transpile examples/luhn-algorithm/luhn_algorithm.eml   # -> Python
pnpm eml run examples/luhn-algorithm/luhn_algorithm.eml         # -> 5 "number -> bool" lines
pnpm eml trace examples/luhn-algorithm/luhn_algorithm.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/luhn-algorithm/luhn_algorithm.eml   # -> OK (fixpoint)
```
