# A checksum that notices order

`verhoeff_check_digit.eml` implements the Verhoeff check digit and measures the thing it does that Luhn cannot.

**What it exercises**: Luhn catches every single-digit error and most
adjacent transpositions - but not all. Verhoeff catches every one of
both, and the reason is structural: it works in the dihedral group D5,
which does **not** commute. A sum-based checksum cannot distinguish two
orderings of the same digits because addition does not either.

The program sweeps every single-digit substitution and every adjacent
transposition over eight base numbers - 504 substitutions, all caught -
and then goes looking specifically for a transposition Luhn accepts,
rather than hoping the sample happens to contain one. It finds
`0914416` / `9014416`: Luhn accepts both, Verhoeff rejects the swap.

Writing it surfaced the classic implementation trap. Validation walks
positions from 0 and generation from 1, because the digit being computed
will occupy position 0. Use the same offset in both and you get an
implementation that is perfectly self-consistent and rejects everything.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  single-digit errors caught:  504/504
  transpositions caught:       28/28
transpositions Luhn misses:    0

Searching for a transposition Luhn cannot detect:
  0914416 and 9014416 are a transposition of each other
    Luhn accepts both:      True / True
    Verhoeff sees the swap: True
    the same swap under Verhoeff: False  (rejected)

Verhoeff caught every substitution and every transposition.

D5 does not commute, and that is the entire reason this works. A checksum
built on addition cannot distinguish two orderings of the same digits,
because addition does not either - so the guarantee is not about better
tables, it is about picking an operation that notices order.
```
