# Exact integer division, by hand

`long_division_exact.eml` implements exact integer division digit by
digit, **because EML-P has no `//` operator**.

**What it exercises**: a measured limit of the language, not an assumed
one.

| expression | result |
|---|---|
| `a // b` | `E_PARSE: Unexpected token SLASH` |
| `int(a / b)` | goes through a 64-bit float — close, and wrong |
| `a % b` | exact, at any size |

For `a = 123456789012345678901234567890`, `b = 7` the two answers agree
for exactly 16 digits — which is where a double runs out of mantissa —
and then diverge for the remaining 13. Both are 29 digits and both start
`1763668414462081`, so no amount of reading the output catches it.

The fix is long division: a running remainder that is always smaller
than the divisor stays small enough to be exact, no matter how large the
dividend. `%` and `*` at full precision are all it needs. The check is
division's defining identity, `q·b + r == a` with `0 ≤ r < b`, over eight
divisors — plus 549 small pairs, because a division routine that is only
correct on big inputs is not a division routine.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  a / 3 -> remainder 0, rebuilds: True
  a / 7 -> remainder 0, rebuilds: True
  a / 11 -> remainder 7, rebuilds: True
  a / 13 -> remainder 0, rebuilds: True
  a / 97 -> remainder 52, rebuilds: True
  a / 1000 -> remainder 890, rebuilds: True
  a / 65537 -> remainder 23325, rebuilds: True

identity holds:        8/8
agrees on small pairs: 549/549

Exact integer division, built from % and * alone.

EML-P has `%` at full precision but no `//`, so the exact quotient of two
large integers is not reachable by any single operator. That gap is worth
stating plainly: `int(a / b)` looks like integer division and is not.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`long_division_exact.trace.jsonl` beside this file is the recorded execution.
