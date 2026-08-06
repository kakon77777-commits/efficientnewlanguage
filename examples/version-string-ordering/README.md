# Version string ordering — correct until the tenth release

`version_string_ordering.eml` sorts one version list three ways — as text, by
numeric component, and by numeric component with missing parts padded to zero —
and counts how many ordered **pairs** the rules disagree on.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a version is a tuple of numbers that happens to be
written with dots. Comparing it as text asks whether `"1"` precedes `"9"`, gets
a definite answer, and stops.

| comparison | disagreements out of 28 pairs |
| --- | --- |
| text vs components | 9 |
| components vs padded | 1 |

```
  1.9 vs 1.10: text says 1, components say -1
```

The number that explains why this survives: over `1.1` through `1.9`, the text
and component rules disagree on **0** pairs — which is every version the
project had until it had ten.

The third rule is not a bug fix, it is a separate decision: treating a missing
component as zero makes `1.2` and `1.2.0` the **same** version, where treating
it as absent makes `1.2` the earlier one. Both are defensible and the file
pins each with a check.

The final check verifies each output is genuinely sorted under its own rule, so
the comparison is measuring the rules rather than a broken sort.

Verify it yourself:

```bash
pnpm eml run examples/version-string-ordering/version_string_ordering.eml
```

```bash
pnpm eml trace examples/version-string-ordering/version_string_ordering.eml --run
```
