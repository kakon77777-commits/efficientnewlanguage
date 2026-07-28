# @cold vs @hot: same answers, different costs

`cold_vs_hot_fibonacci.eml` writes the same recursive Fibonacci twice —
once `@cold`, once `@hot` — to separate two things the temperature model
does not confuse.

```
@cold and @hot give the SAME ANSWERS for a pure function.
@cold and @hot give VERY different COSTS.
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the cost collapse, measured rather than asserted.

`fib_cold(10)` prints exactly **11** `[computing]` lines — one per
distinct argument, `n = 0..10`. Linear, not exponential.

What the uncached version would cost is computed by the program itself,
via a pure recurrence for the call count (`T(0) = T(1) = 1`,
`T(n) = 1 + T(n-1) + T(n-2)`), so no figure here is hardcoded:

```
  n = 10: cached does 11 computations, uncached makes 177 calls
  n = 20: cached does 21 computations, uncached makes 21891 calls
  n = 30: cached does 31 computations, uncached makes 2692537 calls
  n = 40: cached does 41 computations, uncached makes 331160281 calls
```

That counter is itself `@cold` and side-effect free, which is why
counting the cost of exponential recursion is cheap.

The third section then runs the `@hot` version for real at small `n` and
checks it agrees with the `@cold` one — 13 of 13. **This is the claim
that matters**: for pure logic the annotation is a performance contract,
not a semantic one.

**A detail worth watching**: during that check, only `n = 11` and `n = 12`
print new `[computing]` lines. The other 11 values were already cached by
the first section, so 11 of the 13 `@cold` calls cost nothing — the cache
outlives the call that filled it.

The "for pure logic" qualifier is load-bearing; see
[`examples/cold-stale-state/`](../cold-stale-state/) for what happens when
it does not hold.

Verify it yourself:

```bash
pnpm eml transpile examples/cold-vs-hot-fibonacci/cold_vs_hot_fibonacci.eml
pnpm eml run examples/cold-vs-hot-fibonacci/cold_vs_hot_fibonacci.eml         # -> 11 computations, cost table, 13/13 agree
pnpm eml trace examples/cold-vs-hot-fibonacci/cold_vs_hot_fibonacci.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/cold-vs-hot-fibonacci/cold_vs_hot_fibonacci.eml   # -> OK (fixpoint)
```
