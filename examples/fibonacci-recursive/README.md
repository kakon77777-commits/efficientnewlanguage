# Fibonacci (recursive)

`fibonacci_recursive.eml` prints `fib(0)` through `fib(10)` via genuine
double-call self-recursion.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `fib(n) = fib(n-1) + fib(n-2)` — a second
multi-recursive-call function alongside
[`examples/tower-of-hanoi/`](../tower-of-hanoi/), and a deliberate contrast
with the corpus's existing
[`examples/fibonacci-sequence/`](../fibonacci-sequence/), whose own header
comment already notes it is iterative by design. `N=10` keeps the
exponential call count fast enough to run instantly.

Verify it yourself:

```bash
pnpm eml transpile examples/fibonacci-recursive/fibonacci_recursive.eml   # -> Python
pnpm eml run examples/fibonacci-recursive/fibonacci_recursive.eml         # -> fib(0)..fib(10)
pnpm eml trace examples/fibonacci-recursive/fibonacci_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/fibonacci-recursive/fibonacci_recursive.eml   # -> OK (fixpoint)
```
