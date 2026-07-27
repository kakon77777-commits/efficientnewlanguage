# Newton's method for square roots

`newton_sqrt.eml` computes square roots by repeatedly averaging a guess
with `value / guess`, and prints the convergence step by step:

```
step 1: 1.5
step 2: 1.4166666666666665
step 3: 1.4142156862745097
step 4: 1.4142135623746899
step 5: 1.414213562373095
step 6: 1.414213562373095     <- fixed point
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **numerical method** — an
algorithm that *converges toward* an answer rather than computing one
exactly. That changes what correctness means: the question is tolerance,
not equality.

The per-iteration trace is the point. Correct digits roughly **double**
each step (1 → 2 → 5 → 11 → full precision), so five iterations exhaust
what a 64-bit float can represent. Compare
[`examples/bisection-root-finder/`](../bisection-root-finder/), which
gains a fixed fraction of a digit per step and needs an order of magnitude
more iterations for the same accuracy.

Results are checked against EML's own fractional-power operator
(`value^0.5`) — an **independent** computation, not the method checking
itself.

**The comparison uses a tolerance rather than `==`, and this case
demonstrates why that was necessary rather than merely cautious.** Newton
converges here to `1.414213562373095`, which is one unit-in-the-last-place
below the usual printed value of sqrt(2). Two float computations that
agree to every meaningful digit can still differ in the final bit; a case
asserting exact equality would fail for reasons that have nothing to do
with the algorithm being tested.

Worth noting that `eml:equiv` still passes: the interpreter reproduces
CPython's float arithmetic bit for bit across all twenty iterations, so
the case is genuinely gated rather than deferred.

Verify it yourself:

```bash
pnpm eml transpile examples/newton-sqrt/newton_sqrt.eml   # -> Python
pnpm eml run examples/newton-sqrt/newton_sqrt.eml         # -> convergence trace + 5 agreement lines
pnpm eml trace examples/newton-sqrt/newton_sqrt.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/newton-sqrt/newton_sqrt.eml   # -> OK (fixpoint)
```
