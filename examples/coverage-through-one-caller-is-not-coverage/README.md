# Coverage through one caller is not coverage — half the helper has never run

`coverage_through_one_caller_is_not_coverage.eml` instruments a four-branch
helper with a hit counter and runs it from two callers.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the helper is covered — genuinely, not nominally. Every
test of caller A passes through it. What that does not establish is that every
line of the *helper* runs, because coverage flows through the caller's input
space, and the caller does not produce every input the helper accepts.

```
branch hits, per caller
  branch      caller A   caller B
  negative    0          2
  zero        0          2
  small       3          1
  large       3          1

branches never reached through caller A: 2 of 4
```

One of the unreached branches is wrong, and has been since it was written:

```
labels produced
  caller A : ['small', 'large', 'small', 'large', 'small', 'large']
  caller B : ['small', 'refund', 'refund', 'large', 'refund', 'refund']

a zero line is a cancellation, not a refund
  zero lines labelled 'refund': 2
  zero lines caller A can produce: 0
```

```
a suite built from caller A's inputs
  helper branches it exercises : 2 of 4
  defects in the branches it exercises : 0
  defects in the branches it does not  : 1
```

Coverage is a property of a **path** from a caller's inputs to a line.
Reporting it against the caller answers "did we run all of caller A", and the
helper is only covered to the extent caller A's inputs happen to reach it. A
second caller does not add lines — it adds reachability.

**How the counter works, and why it is not a trick.** The hit counter is a list
handed to the helper, and the helper increments an element of it. `=>` binds a
name to a value, and for a list the callee and the caller hold the same object,
so a count incremented inside is visible outside. That is the property
`tests/aliasing-visibility.ts` (axis 15) measures, used here on purpose.

Verify it yourself:

```bash
pnpm eml run examples/coverage-through-one-caller-is-not-coverage/coverage_through_one_caller_is_not_coverage.eml
```
