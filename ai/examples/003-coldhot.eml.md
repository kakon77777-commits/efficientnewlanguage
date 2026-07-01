<!-- canonical: efficientnewlanguage.org/ai/examples/003-coldhot | ai_layer_version: 0.1.0 | updated: 2026-06-30 -->

# Example 003 — Cold / hot functions

`@cold` pure logic becomes cacheable (`@functools.cache`, auto-imported); `@hot` is a marker only.
Functions are **forward-only** (see Round-trip).

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

`ok: false` — **expected**. Function definitions, `@cold`/`@hot`, `async`/`await`, `@temporal_loop`,
and matrices are **forward-only** constructs: they transpile EML → Python but are not part of the
round-trip invariant. The reverse path fails loudly (the literal message reports the decorator `@`
as inexpressible in the supported Python→EML subset).

## Trace event types

`eml:run:start` · `eml:def` (cold) · `eml:def` (hot) · `eml:call` · `eml:sum` · `eml:assign` ·
`eml:cache:miss` · `eml:return` · `eml:assign` · `eml:output` · `eml:call` · `eml:output` ·
`eml:return` · `eml:run:done`
