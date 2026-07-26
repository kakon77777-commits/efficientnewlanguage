# Roman numeral to integer

`roman_to_integer.eml` converts Roman numerals back to integers, and
reports `10 of 10 round-tripped back to the original integer`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the reverse direction of
[`examples/roman-numeral-converter/`](../roman-numeral-converter/), and a
neat asymmetry between the two. Going *to* Roman needs an explicit table
of subtractive forms (`CM`, `CD`, `XC`, `XL`, `IX`, `IV`) as entries.
Coming *back* needs no such table at all — one rule covers every case:
scan left to right adding values, except when a symbol is smaller than the
one after it, in which case subtract it. Six special cases collapse into a
single comparison.

**This case doubles as a cross-file round-trip check.** The ten numerals
are not arbitrary — they are exactly what the forward case prints, paired
with the ten integers that produced them. Every line must report
`(matches)`; a mismatch would mean the two directions have drifted apart,
and the summary line makes that impossible to miss at a glance.

Verify it yourself:

```bash
pnpm eml transpile examples/roman-to-integer/roman_to_integer.eml   # -> Python
pnpm eml run examples/roman-to-integer/roman_to_integer.eml         # -> 10 match lines + a 10-of-10 summary
pnpm eml trace examples/roman-to-integer/roman_to_integer.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/roman-to-integer/roman_to_integer.eml   # -> OK (fixpoint)
```
