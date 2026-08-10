# Normalisation makes the old tests unreachable — 8 cases, 3 doing work, coverage down

`normalisation_makes_the_old_tests_unreachable.eml` puts a normaliser in front
of a router and measures what happened to the existing test suite.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the tests were written against raw input, when raw input
was what arrived. Normalisation now runs first, so the values reaching the code
under test are canonical — and cases that were distinct as raw inputs are the
same input once normalised.

```
the existing test inputs, written before the normaliser
  cases          : 8
  distinct raw   : 8
  distinct after normalisation : 3
  cases that became copies of another case : 5
```

They still pass. They pass **together, on the same value**, having become
copies of each other without anyone editing them:

```
the suite, run through the composed pipeline
  cases failing: 0 of 8

cases that assert about a value an earlier case already asserted about: 5
cases doing new work: 3
```

**Worse than redundant — a branch is now unreachable and its test is green:**

```
router branches reached
  branch          raw   normalised
  queue            1     4
  archive          1     3
  queue-legacy     1     0
  unknown          5     1

branches reachable before the normaliser and not after: 1
```

`queue-legacy` handles the raw `"OPEN"` tag. Nothing can send `"OPEN"` to the
router any more. Its code is unreachable and its test is passing, which are the
two facts that between them guarantee nobody will look at it.

The suite is green, its size is unchanged, and its coverage of the router went
down. Nothing edited a test. Composition changed which inputs exist, and a test
is only as good as the reachability of the value it feeds in.

Verify it yourself:

```bash
pnpm eml run examples/normalisation-makes-the-old-tests-unreachable/normalisation_makes_the_old_tests_unreachable.eml
```
