# The regression test locks in the workaround — green in the 2 states where the system is wrong

`the_regression_test_locks_in_the_workaround.eml` classifies every assertion in
a suite against the rule it was supposed to protect.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the cause was in a component another team owned, so the
team that got the report shipped a workaround and — correct procedure — added a
regression test so the symptom could not come back. The test asserts the
*workaround's* output.

```
tests in the suite : 5

  before the workaround (upstream broken)      : 0 pass
  with the workaround (upstream still broken)  : 5 pass
  upstream fixed, workaround removed           : 3 pass
  upstream fixed, workaround left in place     : 5 pass
```

**The suite is green in exactly the states where the workaround is present:**

```
states in which the suite is fully green
  green in 2 of 4 states
    upstream broken + workaround
    upstream fixed + workaround
```

**And the state that is actually correct is the one that turns it red:**

```
correct outputs over a wider input set
  upstream broken + workaround : 4 of 7
  upstream fixed + workaround : 4 of 7
  upstream fixed, no workaround : 7 of 7
  upstream broken, no workaround : 0 of 7
```

The only configuration that serves every input correctly is the only one the
suite rejects.

**Which tests are doing the rejecting:**

```
tests that fail once the upstream cause is fixed and the workaround removed
  c#dev : asserts cdev, got c#dev  - this assertion is the workaround
  e#f : asserts ef, got e#f  - this assertion is the workaround
  failing : 2
  of those, defending the rule      : 0
  of those, defending the workaround : 2
```

Nothing about that red distinguishes "the fix is broken" from "the test is
defending the bug", and the person reading it has one afternoon.

Nothing is declared: every assertion is compared against the rule, so which
tests defend which is measured rather than remembered.

A regression test records what the output was when somebody decided it was
acceptable. If that moment was during a workaround, the record is of the
workaround — and the file whose job is to stop the bug returning is now the
reason it cannot leave.

Verify it yourself:

```bash
pnpm eml run examples/the-regression-test-locks-in-the-workaround/the_regression_test_locks_in_the_workaround.eml
```
