# Happy number

`happy_number.eml` tests six numbers for "happiness": repeatedly replace a
number with the sum of the squares of its digits, and it is happy if that
process reaches 1 (`19 -> 82 -> 68 -> 100 -> 1`).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: **cycle detection as a termination requirement**,
not an optimization. Unhappy numbers never reach 1 — they fall into the
cycle `4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4` forever — so the
dict-as-set `seen` check (same idiom as
[`examples/duplicate-remover/`](../duplicate-remover/)) is the only reason
this program halts at all on inputs like `4` and `20`. Remove that one
line and the case hangs rather than failing.

Also uses the corpus's standard digit-peeling idiom (`n % 10` plus
`int(n / 10)`), shared with
[`examples/digit-sum-calculator/`](../digit-sum-calculator/) and
[`examples/digital-root-recursive/`](../digital-root-recursive/).

Verify it yourself:

```bash
pnpm eml transpile examples/happy-number/happy_number.eml   # -> Python
pnpm eml run examples/happy-number/happy_number.eml         # -> 6 "n -> happy: bool" lines
pnpm eml trace examples/happy-number/happy_number.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/happy-number/happy_number.eml   # -> OK (fixpoint)
```
