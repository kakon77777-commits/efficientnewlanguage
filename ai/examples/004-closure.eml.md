<!-- canonical: efficientnewlanguage.org/ai/examples/004-closure | ai_layer_version: 0.1.0 | updated: 2026-06-30 -->

# Example 004 — Closures (nested functions)

A nested `def` captures the enclosing parameter `n` (lexical closure). Forward-only.

## EML

```eml
def adder(n):
    def add(x):
        return x + n
    add(10) => r
    return r

adder(5) => out
out^0
```

## Python (deterministic transpilation)

```python
def adder(n):
    def add(x):
        return x + n
    r = add(10)
    return r

out = adder(5)
print(out)
```

## stdout (executed)

```text
15
```

## Round-trip

`ok: false` — **expected**: function definitions are forward-only and not part of the round-trip
invariant.

## Trace event types

`eml:run:start` · `eml:def` · `eml:call` · `eml:def` · `eml:call` · `eml:return` · `eml:assign` ·
`eml:return` · `eml:assign` · `eml:output` · `eml:run:done`
