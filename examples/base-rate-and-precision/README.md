# Base rate and precision — 99% accurate, and most alerts are false

`base_rate_and_precision.eml` holds a test fixed at 99% sensitivity and 99%
specificity, sweeps the base rate, and reports precision at each one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two numbers that describe the same test and move in
completely different ways.

| | what it measures | about |
| --- | --- | --- |
| accuracy | how often the test is right | the test |
| precision | how often a **positive** is right | the world |

Across the whole sweep, with the test never changing:

```
  accuracy ranges from 98.9% to 99.0%  (spread 0.1%)
  precision ranges from 0.0% to 99.0%  (spread 99.0%)
```

At 1 case per 100,000 the test flags 1000 people and is right about **none** of
them by the rounding shown. The false positives are drawn from the large
population and the true positives from the small one, so a 1% error rate on the
large population outnumbers a 99% catch rate on the small one.

The break-even — where a positive is more likely right than wrong — is at
**1000 per 100k**, i.e. a prevalence of 1%, which for a test with equal
sensitivity and specificity of 99% is exactly where precision reaches 50%.

The last section separates which improvement helps: at a fixed base rate,
raising specificity from 99% to 99.9% takes precision from 0.0% to 8.2%, while
raising sensitivity does almost nothing — because the false positives come from
the large population.

Everything is integer counts over a fixed population, so the numbers are exact
rather than rounded probabilities.

Verify it yourself:

```bash
pnpm eml run examples/base-rate-and-precision/base_rate_and_precision.eml
```

```bash
pnpm eml trace examples/base-rate-and-precision/base_rate_and_precision.eml --run
```
