<!-- canonical: efficientnewlanguage.org/ai/examples/005-recursion | ai_layer_version: 0.1.0 | updated: 2026-06-30 -->

# Example 005 — Recursion

Self-recursive factorial via the ternary `?:`. `loopKind: recursive` (deterministic; not statically
proven terminating). Forward-only.

## EML

```eml
def fact(n):
    n <= 1 ? 1 : n * fact(n - 1) => r
    return r

fact(6) => x
x^0
```

## Python (deterministic transpilation)

```python
def fact(n):
    r = 1 if n <= 1 else n * fact(n - 1)
    return r

x = fact(6)
print(x)
```

## stdout (executed)

```text
720
```

## Round-trip

`ok: false` — **expected**: function definitions are forward-only.

## Trace event types

`eml:run:start` · `eml:def` · `eml:call` ×6 (fact 6→1) · `eml:assign`/`eml:return` ×6 (unwind) ·
`eml:assign` · `eml:output` · `eml:run:done`
