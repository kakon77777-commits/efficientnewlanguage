# The counterexample outside the generator — 2000 inputs found 0, 160 found 52

`the_counterexample_outside_the_generator.eml` checks two real implementations
of integer division against each other and varies the sample count and the
sample range separately.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: truncation toward zero and flooring agree on every
non-negative numerator and disagree on negatives that do not divide evenly.
That is a real divergence, not a contrived one. The generator draws numerators
from 0 upward, because that is what the caller was documented to pass. So the
check is sound, the implementations are as written, and the result is zero —
at any sample size.

```
generator as written - numerators from 0
  100 inputs  : 0 divergences
  500 inputs  : 0 divergences
  2000 inputs : 0 divergences

generator widened - numerators from -60
  160 inputs  : 52 divergences
```

**Count was never the binding constraint:**

```
  2000 inputs from the narrow generator : 0
  160 inputs from the wide generator   : 52
  the smaller sweep found more, and count was never the constraint
```

**Every divergence sits on the side the generator cannot produce:**

```
divergences by sign of numerator
  negative numerators tried : 60, diverging : 52
  positive numerators tried : 2000, diverging : 0
  every divergence is on the side the generator cannot produce
```

**A witness, printed rather than asserted** — and a control from inside the
narrow range, without which the reader cannot tell whether the two
implementations differ everywhere and the sweep is simply broken:

```
witness
  n            : -60
  truncating   : -8
  flooring     : -9
  n % d        : 3

control - a numerator inside the narrow range
  n            : 13
  truncating   : 1
  flooring     : 1
  they agree here, so the sweep's zero is a real observation
```

A sweep reports two things and returns one: what it found, and the shape of the
inputs it was able to build. When those inputs are drawn from a subspace, the
sample count measures effort, not coverage.

Verify it yourself:

```bash
pnpm eml run examples/the-counterexample-outside-the-generator/the_counterexample_outside_the_generator.eml
```
