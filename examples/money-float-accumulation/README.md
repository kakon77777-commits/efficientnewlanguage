# Money in floats — a difference that prints as -0.00

`money_float_accumulation.eml` adds the same money two ways — as floats and as
integer cents — over runs of 10 to 2000 items, and reports equality, the
direction of the gap, and what a reconciliation report would print.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the file was written to demonstrate the familiar story —
error accumulating over a long ledger — and the measurement disagreed with it
**twice**.

| items | float total | exact | equal |
| --- | --- | --- | --- |
| 10 | 0.09999999999999999 | 0.1 | False |
| 100 | 1.0000000000000007 | 1.0 | False |
| 1000 | 9.999999999999831 | 10.0 | False |
| 2000 | 20.000000000000327 | 20.0 | False |

**Ten items already differ.** There is no safe length; the shortest run
measured is already wrong.

**The direction is not stable.** Across increasing n the float total comes out
`low high low low high`. It is not a drift a correction factor could absorb —
two teams sampling different batch sizes reach opposite conclusions about which
side the money is on. Both of those are now checks, so neither premise can
quietly come back.

What the report shows for a thousand items:

```
  difference:       -0.00
  equal: False
```

**A third premise also failed, and it is kept as a check rather than dropped**:
converting a float price back to cents with the obvious `int(x * 100 + 0.5)`
survives **every** price from 1 cent to 20 dollars — 2000 of 2000. The danger
is not representing a price. It is adding prices up. That check asserts
something is *fine*, which keeps the case's scope honest: if a future change
breaks it, the case is wrong rather than merely incomplete.

Verify it yourself:

```bash
pnpm eml run examples/money-float-accumulation/money_float_accumulation.eml
```

```bash
pnpm eml trace examples/money-float-accumulation/money_float_accumulation.eml --run
```
