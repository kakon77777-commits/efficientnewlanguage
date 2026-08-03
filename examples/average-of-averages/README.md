# Winning every group and losing the company

`average_of_averages.eml` computes a company-wide rate two ways over the same data and shows the two disagree about which method is better.

**What it exercises**: the mean of ratios weights every *group* equally;
the correct figure weights every *observation* equally. They coincide
only when the groups are the same size, which is why the bug survives
tidy fixtures — demonstrated here by rebuilding the same data with equal
denominators, where the two agree exactly.

The data is arranged so Simpson's paradox fires: method A wins **all
three** subgroups and loses the pool, 5.00% to 18.33%, because the
groups where it wins are the small ones. Both figures are exact; nothing
here is a rounding artefact.

The reason it is hard to catch is in the last check: both numbers pass
every sanity test you can apply to one of them alone. Each lies between
the smallest and largest group rate, each is a percentage, each is
stable across runs. They can only be told apart by computing the other
one — which is why a ratio has to be carried as a pair all the way to
the end.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

With equal group sizes the two agree exactly:
  mean of rates: 17.33%
  pooled:        17.33%
  identical:     True

largest gap between a group rate and the pooled rate: 25.00% (north)

checks passed: 5/5
A wins every group and loses the company. Both figures are exact.

Both numbers pass every sanity check you can apply to one of them alone:
each is between the smallest and largest group rate, each is a percentage,
each is stable across runs. They can only be told apart by computing the
other one - which means a ratio has to be carried as a pair all the way to
the end, because the denominator is the part that gets thrown away first.
```
