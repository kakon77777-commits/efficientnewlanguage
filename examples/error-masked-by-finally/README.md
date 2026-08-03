# Cleanup that deletes the reason

`error_masked_by_finally.eml` runs the same failing operation through four `try/finally` shapes and reports what the caller actually observes.

**What it exercises**: a `finally` that raises replaces the original
exception; a `finally` that returns erases it entirely. Two of the four
shapes here report something other than the real problem.

The finding is that the two broken shapes are **not equally dangerous**,
which this file got wrong at first. A `finally` that returns is wrong on
every path — it answers "swallowed" even when nothing failed — so any
test catches it. A cleanup that raises only while unwinding (because it
is releasing a resource whose acquisition is what failed) is
byte-identical to the correct shapes on the success path. Three of four
agree there; the odd one out is the harmless one.

So the dangerous shape is discovered during an incident rather than
before one, and what it destroyed is exactly the information the
incident needed. There is also a check that every shape still *ran* its
cleanup — suppressing the error by skipping the work is not the fix.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
shapes agreeing on the success path: 3/4
the answer the agreeing ones give:   value result
the odd one out is `returning`, which is broken on BOTH paths.
`raising` is identical to the correct shapes here - that is why it ships.

shapes that still ran their cleanup: 4/4

checks passed: 5/5
Two shapes erase the error; only one of them is invisible when nothing fails.

The two broken shapes are not equally dangerous, which is the thing this
file got wrong at first. A finally that RETURNS is wrong on every path and
any test catches it. A cleanup that raises only while unwinding is
byte-identical to the correct version whenever nothing has failed - so it
is discovered during an incident rather than before one, and what it
destroyed is exactly the information the incident needed.
```
