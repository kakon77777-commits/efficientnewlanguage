<!-- canonical: efficientnewlanguage.org/ai/examples/003-coldhot | ai_layer_version: 0.1.0 | updated: 2026-07-19 -->

# Example 003 — Cold / hot functions

`@cold` pure logic becomes cacheable (`@functools.cache`, auto-imported); `@hot` is a marker only.
Function definitions and `@cold` round-trip. `@hot` has one documented cosmetic exception.

## EML

```eml
# cold = pure, cacheable logic
@cold
def square_sum(N):
    Σ(i^2, i in [1:N]) => r
    return r

# hot = dynamic state / I/O
@hot
def greet(name):
    name^0
    return name

square_sum(100) => total
total^0
greet(total)
```

## Python (deterministic transpilation)

```python
import functools

@functools.cache
def square_sum(N):
    r = sum(i**2 for i in range(1, N+1))
    return r

# @hot: dynamic state — not cached
def greet(name):
    print(name)
    return name

total = square_sum(100)
print(total)
greet(total)
```

## stdout (executed)

```text
338350
338350
```

## Round-trip

`ok: false` — **expected, but narrower than it looks**. Function definitions and `class` ARE fully
bidirectional; the ONLY reason this specific example doesn't round-trip is `@hot`, which has no
Python equivalent and is rendered forward as a bare comment (`# @hot: dynamic state — not cached`)
for human readability. Comments aren't tokenized, so the reverse leg can't recover the decorator —
a permanent, purely cosmetic one-line difference, not a functional one. Matrices (`<M>`/`np.array`)
round-trip too; only `@temporal_loop` and `async`/`await` remain genuinely forward-only (the
reverse transpiler does not support them).

## Trace event types

`eml:run:start` · `eml:def` (cold) · `eml:def` (hot) · `eml:call` · `eml:sum` · `eml:assign` ·
`eml:cache:miss` · `eml:return` · `eml:assign` · `eml:output` · `eml:call` · `eml:output` ·
`eml:return` · `eml:run:done`
