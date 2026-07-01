<!-- canonical: efficientnewlanguage.org/ai/examples/002-conditional | ai_layer_version: 0.1.0 | updated: 2026-06-30 -->

# Example 002 — Conditional & membership

Ternary `?:` and inclusive-range membership (`in [1:100]` → `range(1, 101)`).

## EML

```eml
x^+50
x > 40 ? 1 : 0 => y
y^0
x in [1:100] => inRange
inRange^0
```

## Python (deterministic transpilation)

```python
x = 50
y = 1 if x > 40 else 0
print(y)
inRange = x in range(1, 101)
print(inRange)
```

## stdout (executed)

```text
1
True
```

## Round-trip

`ok: true` — round-trip fixpoint reached (`python1 == python2`).

## Trace event types

`eml:run:start` · `eml:assign` · `eml:assign` · `eml:output` · `eml:assign` · `eml:output` · `eml:run:done`
