# The safe range of a composition — neither the union nor the intersection

`the_safe_range_of_a_composition.eml` sweeps every integer input from 0 to 100
through two functions with documented safe ranges and reads the composition's
safe set off the results.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `scale` is documented safe for 0–50. `shift` is
documented safe for 40–100. Both documents are accurate. Neither says anything
about the composition, because a safe range is a statement about *one*
function's inputs, and the composition's inputs are the first function's while
its risk lives in the second's.

```
sweeping every integer input from 0 to 100
  scale safe on inputs       : 0 .. 50   (51 values)
  shift safe on ITS inputs   : 40 .. 100  (61 values)
  composition safe on inputs : 20 .. 50   (31 values)
```

**The two natural guesses fail in different ways, and only measuring separates
them:**

```
guess 1: the safe set is the intersection of the two documented ranges
  intersection : 40 .. 50
  inputs inside the intersection that are NOT safe: 0
  safe inputs the intersection MISSES            : 20 of 31
  so the intersection is sound but not complete - a different kind of
  wrong from the union, and the one that quietly shrinks throughput

guess 2: the safe set is the union of the two documented ranges
  union : 0 .. 100
  inputs inside the union that are NOT safe: 70
```

The intersection is not "wrong" the way the union is. It admits nothing unsafe
— and rejects 20 of the 31 inputs that are fine. That failure costs throughput
instead of correctness, so it never gets investigated.

**Where the real boundary comes from:**

```
the composition's own boundary
  smallest safe input : 20  -> scale gives 40, shift gives 10
  largest safe input  : 50  -> scale gives 100, shift gives 70

  one below : 19 -> scale gives 38, which shift is not safe on
  one above : 51 -> scale gives 102, which scale is not safe on
```

The lower bound is set by the **second** function and the upper bound by the
**first**, and both are stated in units of their own input. Neither document is
wrong and neither is enough.

Verify it yourself:

```bash
pnpm eml run examples/the-safe-range-of-a-composition/the_safe_range_of_a_composition.eml
```
