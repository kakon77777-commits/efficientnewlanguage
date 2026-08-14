# Passed means did not raise — perfect on 2 of 4, blind on the other 2

`passed_means_did_not_raise.eml` runs four broken variants of the same function
through a smoke test and a value test.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a test that only calls the function is the first test
anybody writes and it is genuinely useful — it catches import errors, signature
drift, and every failure where the code cannot execute at all. It is also the
test most likely to survive untouched into a suite people trust, because it
never goes red for a silly reason. The question it answers is "did control
reach the end".

**The reference is checked first**, so the table below cannot be an artifact of
a wrong reference — and it is a separate expression of the rule, not a copy of
the correct variant:

```
reference check, on the correct variant
  inputs where the two independent expressions agree : 4 of 4
```

```
variant                     smoke   value
  correct  ... green   green
  gold rate wrong  ... GREEN   red
  standard rate dropped  ... GREEN   red
  raises on gold  ... red
  divides by zero on gold  ... red

broken variants   : 4
  smoke test catches : 2
  value test catches : 4
```

**Split by what kind of breakage it is:**

```
by kind of breakage
  variants that cannot finish : 2, smoke catches 2
  variants that finish wrong  : 2, smoke catches 0

The smoke test is perfect on one kind and blind on the other, and the
two kinds are not distinguishable from its output.
```

A green smoke test is a true statement about reachability. Read as a statement
about correctness it covers 0 of 2 wrong answers.

**Related.** [the-test-asserts-the-format-not-the-value](../the-test-asserts-the-format-not-the-value/)
is the same mismatch one level up: there the assertion constrains something,
just not the thing the caller depends on. Here it constrains almost nothing and
still passes review, because what it does constrain is real.

Verify it yourself:

```bash
pnpm eml run examples/passed-means-did-not-raise/passed_means_did_not_raise.eml
```
