# The depth limit was shared with the caller

`the_depth_limit_was_shared_with_the_caller.eml` - A recursive tree walker is documented as supporting trees up to 497 levels deep. The same record that passes in the test suite fails in the request handler. What changed between the two is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Recursion is the right shape for a tree and the iterative rewrite is harder to read and easy to get wrong. The limit was measured rather than guessed: somebody built trees of increasing depth, found where it broke, wrote the number down, and put a guard in front of the walker that rejects anything deeper. That is more care than most such functions get.

The measurement was taken from the test harness, where almost nothing is on the stack. A recursion limit counts frames for the whole process, not frames belonging to this function, so what the walker can survive depends on how deep the stack already was when it was called.

That makes the documented number a property of a call site rather than of the function, which is not how a number in a docstring reads, and it means a change in an unrelated file can lower it without mentioning trees at all.

```
the walker
  recursion limit, process wide : 1000 frames
  frames used per tree level    : 2
  documented maximum depth      : 497
  where that number was measured: unit test
```

```
the record being walked is 400 levels deep and needs 800 frames
```

```
call site                      stack before   supported depth   this record
  unit test                      5              497               passes
  command line tool              22             489               passes
  nightly batch job              60             470               passes
  request handler                340            330               fails
  request handler, tracing on    388            306               fails
```

```
  call sites where it passes : 3
  call sites where it fails  : 2
  the record is byte for byte the same in every row
```

```
control - the same record, run from the test harness
  stack before      : 5
  supported depth   : 497
  record depth      : 400
  result            : passes, with 195 frames to spare
  so the input is not the variable, and neither is the walker
```

```
a configuration flag, in another file, owned by another team
  frames added by tracing        : 48
  supported depth before         : 330
  supported depth after          : 306
  depth lost                     : 24
  records between those two depths that now fail : every one of them
  the flag's description does not contain the word depth, because the
  flag has nothing to do with depth
```

```
the guard in front of the walker
  it rejects trees deeper than   : 497
  it is correct at the call site : unit test
  at command line tool            it admits 8 depths that fail
  at nightly batch job            it admits 27 depths that fail
  at request handler              it admits 167 depths that fail
  at request handler, tracing on  it admits 191 depths that fail
  call sites where the guard admits records that will fail : 4 of 5
  a guard that holds a constant cannot describe a quantity that is shared
```

```
three ways to write the limit down
  a constant in a docstring : wrong everywhere except where it was measured
  measured at import time   : wrong, import runs at a different stack depth
  read at entry to the walk : correct, because that is when the answer exists
  the third one gives 497 at the unit test and 306 in the traced handler
```

Recursion is the right shape for a tree and the limit was measured rather than guessed. A recursion limit counts the whole process, so the walker supports 497 levels from the test harness and 306 from the traced handler: the same 400-level record passes at 3 call sites and fails at 2.

Verify it yourself:

```bash
pnpm eml run examples/the-depth-limit-was-shared-with-the-caller/the_depth_limit_was_shared_with_the_caller.eml
```
