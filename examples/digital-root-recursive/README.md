# Digital root (recursive)

`digital_root_recursive.eml` computes the digital root (repeated digit-sum
until one digit remains) of five sample numbers (`12345, 999, 8, 0,
132189`).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two cooperating recursive functions — `sum_digits`
(genuine self-recursion peeling off one digit per call via
`int(n / 10)`, the corpus's standard floor-division idiom) and
`digital_root` (recurses on `sum_digits`' own result until it drops below
10) — a deliberate contrast with the corpus's existing
[`examples/sum-of-digits-recursive/`](../sum-of-digits-recursive/), which
sums digits exactly once rather than repeating until a single digit
remains.

Verify it yourself:

```bash
pnpm eml transpile examples/digital-root-recursive/digital_root_recursive.eml   # -> Python
pnpm eml run examples/digital-root-recursive/digital_root_recursive.eml         # -> 5 "n -> digital root r" lines
pnpm eml trace examples/digital-root-recursive/digital_root_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/digital-root-recursive/digital_root_recursive.eml   # -> OK (fixpoint)
```
