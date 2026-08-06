# Percent composition — a positive average quarter and a losing year

`percent_composition.eml` composes sequences of percentage changes and compares
the arithmetic mean of the periods against the actual total.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: percentages are ratios, and ratios compose by
multiplication. Almost every mistake with them is the same mistake — adding.

```
  down half, up half: mean 0.00%, total -25.00%
```

Down a half and back up a half lands at **exactly** −25%, and the two orders
agree, so the problem is not ordering — multiplication commutes. Adding is what
breaks.

At least one series has a **positive average and a negative total**, which is
the summary statistic that misleads without being wrong.

Two discounts do not add either: 50% off then 25% off leaves 37.5 of 100, where
75% off would leave 25.0.

And recovery costs more than the loss, at every loss:

| lose | need to get back |
| --- | --- |
| 25% | +33.3% |
| 50% | +100.0% |
| 75% | +300.0% |

**Every percentage in the file is a half or a quarter**, chosen so all the
arithmetic is exact in binary floating point. That is deliberate: this case is
about the composition rule, and float representation error is measured
separately in [`examples/money-float-accumulation/`](../money-float-accumulation/).
Mixing them would let either one explain the other's result.

Verify it yourself:

```bash
pnpm eml run examples/percent-composition/percent_composition.eml
```

```bash
pnpm eml trace examples/percent-composition/percent_composition.eml --run
```
