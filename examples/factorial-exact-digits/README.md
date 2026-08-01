# 50! exactly, checked four ways

`factorial_exact_digits.eml` computes 50! and then checks it against
facts known independently of the multiplication that produced it.

**What it exercises**: 50! is 65 digits long. A language holding it in
a 64-bit float keeps about 16 significant digits and silently rounds
the other 49 — and the rounded answer still *looks* like a factorial:
same magnitude, same leading digits, plausible in every way. Nothing
errors. That is the failure this case rules out, and it is why every
check refuses to use the product as its own witness.

| witness | what it uses |
|---|---|
| trailing zeros | Legendre's formula, ⌊50/5⌋ + ⌊50/25⌋ = 12 |
| digit count | multiplying 1 by 10 until it passes 50! |
| divisibility | exact `%` against every k in 1..50 |
| **in**divisibility | `%` against 53, 59, 61, 67, 71 |

The negative witness is the important one. A rounded value is divisible
by small numbers roughly at random, so "divides by everything below 50"
is weak evidence — "divides by everything below and *nothing* above" is
not.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 14 lines)

```
30414093201713378043612608166064768844377641568960512000000000000

digits, counted by multiplying up:  65
digits, from the rendered string:   65
trailing zeros observed:            12
trailing zeros Legendre predicts:   12
divides evenly by 1..50:            50/50
NOT divisible by 53,59,61,67,71:    5/5

Exact. Four witnesses agree, and none of them trusted the product.

For scale: 2^53, the last integer a 64-bit float represents exactly, is 16
digits. This number is 65. Every digit past the sixteenth is only there
because integers here are arbitrary-precision rather than doubles.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`factorial_exact_digits.trace.jsonl` beside this file is the recorded execution.
