# The compensated sum and the loop disagree

`the_compensated_sum_and_the_loop_disagree.eml` - The same numbers added two ways give two answers. Which addition each way performs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both are correct additions. `sum()` carries a compensation term so the rounding error of each step is folded back in, which is the better algorithm and is why it is the builtin. A loop with `+` does exactly what `+` is specified to do at each step, and every one of those steps is right.

The difference is not in any step. It is in what is kept between steps: the builtin keeps the part that would have been lost, the loop does not, and after ten additions the two totals are different numbers.

Both are run over the same list and compared at every prefix.

```
adding 10 values of 0.1
  a loop with +   : 0.9999999999999999
  sum()           : 1.0
  the two disagree
  the loop total does not equal 1.0
  the builtin total equals 1.0
```

```
prefix   loop total            sum() of the same prefix   equal
  1        0.1        0.1        yes
  2        0.2        0.2        yes
  3        0.30000000000000004        0.30000000000000004        yes
  4        0.4        0.4        yes
  5        0.5        0.5        yes
  6        0.6        0.6000000000000001        no 
  7        0.7        0.7000000000000001        no 
  8        0.7999999999999999        0.8        no 
  9        0.8999999999999999        0.9        no 
  10        0.9999999999999999        1.0        no 
```

```
they first differ at 6 values
  before that the two agree - neither is exact at 3 values, they are wrong
  together - so a check on a short list cannot separate them
```

```
steps whose own increment was not exactly 0.1 : 8 of 10
  so the error is visible per step after all, and it is tiny at each one
  what accumulates is the sum of those, which no single step reports
```

```
a test asserting the total is 1.0
  written with sum()   : passes
  written with a loop  : fails
  the same data, the same assertion, and the choice of accumulator decides it
```

```
the difference between the two totals
  1.1102230246251565e-16
  small enough that no tolerance anyone sets would reject either total,
  and large enough that == rejects one of them
```

```
the same list scaled to money, in whole cents
  a loop over integers : 100
  sum() over integers  : 100
  identical, because integer addition has nothing to lose between steps
  the unit is what removed the problem, not the algorithm
```

```
control - values that are exact in binary
  loop  : 1.625
  sum() : 1.625
  the same, so this list cannot separate the two accumulators
```

Both routes perform correct additions and one of them keeps what the other discards. The choice shows up in no step and in the total, so a program is tested on the steps and used for the total.

Verify it yourself:

```bash
pnpm eml run examples/the-compensated-sum-and-the-loop-disagree/the_compensated_sum_and_the_loop_disagree.eml
```
