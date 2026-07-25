# Fibonacci (memoized)

`fibonacci_memoized.eml` prints `fib(0)`..`fib(15)` and then `fib(50) =
12586269025`, using recursion with a dict cache.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: memoization — the entry point to dynamic
programming — and it completes this corpus's Fibonacci trio:

| Case | Strategy | Cost |
| --- | --- | --- |
| [`fibonacci-sequence`](../fibonacci-sequence/) | iterative, two running variables | linear |
| [`fibonacci-recursive`](../fibonacci-recursive/) | naive double recursion | exponential |
| this case | same recursion + dict cache | linear |

`fib(50)` is the whole point: it is the same recursive function as the
naive case, but naive would need roughly 40 billion calls to get there and
simply is not runnable — memoized it costs 49 cached entries and returns
instantly. The result also exceeds 32 bits, so it exercises EML's
arbitrary-precision integers along the way.

Verify it yourself:

```bash
pnpm eml transpile examples/fibonacci-memoized/fibonacci_memoized.eml   # -> Python
pnpm eml run examples/fibonacci-memoized/fibonacci_memoized.eml         # -> fib(0)..fib(15), fib(50), cache size
pnpm eml trace examples/fibonacci-memoized/fibonacci_memoized.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/fibonacci-memoized/fibonacci_memoized.eml   # -> OK (fixpoint)
```
