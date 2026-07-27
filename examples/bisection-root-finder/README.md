# Bisection root finder

`bisection_root_finder.eml` finds roots by halving an interval whose
endpoints give the function opposite signs — a root must lie between them.

```
Root of x^3 - x - 2 on [1, 2]:
  10 iterations: 1.52099609375
  20 iterations: 1.5213799476623535
  30 iterations: 1.521379706915468
  40 iterations: 1.5213797068049644
  50 iterations: 1.5213797068045678
  60 iterations: 1.5213797068045674
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a deliberate counterpart to
[`examples/newton-sqrt/`](../newton-sqrt/). The second target function
here is `x^2 - 2`, whose positive root **is** sqrt(2) — so the same number
is computed twice by unrelated methods, and how they get there is the
whole comparison:

| | Uses | Per step | To full float precision |
| --- | --- | --- | --- |
| Newton | the derivative | doubles correct digits | ~5 iterations |
| Bisection | only the **sign** of the function | gains one bit | ~50 iterations |

The printed iteration table makes that concrete: after **5** bisection
steps the error against sqrt(2) is still about `0.0077`, roughly where
Newton already had full precision. Bisection's compensation is that it
cannot diverge and needs no derivative — it only needs the interval to
bracket a sign change.

Two implementation notes:

- EML has no function values to pass around, so the target function is
  selected by an integer rather than handed in as an argument.
- Agreement with `2^0.5` is checked with a tolerance, not `==`. Bisection
  lands on `1.4142135623730954` against the operator's
  `1.4142135623730951` — a last-bit difference, exactly the situation an
  exact-equality assertion would fail on for reasons unrelated to the
  algorithm.

Verify it yourself:

```bash
pnpm eml transpile examples/bisection-root-finder/bisection_root_finder.eml   # -> Python
pnpm eml run examples/bisection-root-finder/bisection_root_finder.eml         # -> iteration table, sqrt(2) agreement, 5-step error
pnpm eml trace examples/bisection-root-finder/bisection_root_finder.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/bisection-root-finder/bisection_root_finder.eml   # -> OK (fixpoint)
```
