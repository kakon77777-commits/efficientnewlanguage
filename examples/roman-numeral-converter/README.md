# Roman numeral converter

`roman_numeral_converter.eml` converts ten sample integers to Roman
numerals, spanning every subtractive form (`1994 -> MCMXCIV`,
`3999 -> MMMCMXCIX`).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: greedy conversion driven by two parallel lists (a
descending value table and its matching symbol table), with the
subtractive forms `CM/CD/XC/XL/IX/IV` as ordinary table entries rather
than special cases — which is what keeps the nested `while` loop this
short. Distinct from the corpus's
[`examples/base-converter/`](../base-converter/), which is positional
(repeated division by a radix) rather than table-driven.

Verify it yourself:

```bash
pnpm eml transpile examples/roman-numeral-converter/roman_numeral_converter.eml   # -> Python
pnpm eml run examples/roman-numeral-converter/roman_numeral_converter.eml         # -> 10 "n -> numeral" lines
pnpm eml trace examples/roman-numeral-converter/roman_numeral_converter.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/roman-numeral-converter/roman_numeral_converter.eml   # -> OK (fixpoint)
```
