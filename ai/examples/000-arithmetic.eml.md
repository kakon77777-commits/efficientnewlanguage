<!-- canonical: efficientnewlanguage.org/ai/examples/000-arithmetic | ai_layer_version: 0.1.0 | updated: 2026-06-30 -->

# Example 000 — Arithmetic & augmented assign

Demonstrates the two-stage `^+` rule (declare then augment) and `^*` / `^0`.

## EML

```eml
x^+100
x^+10
x^*2
x^0
```

## Python (deterministic transpilation)

```python
x = 100
x += 10
x *= 2
print(x)
```

## stdout (executed)

```text
220
```

## Round-trip

`ok: true` — round-trip fixpoint reached (`python1 == python2`).

## Trace event types (phosphor-jsonl-v1)

`eml:run:start` · `eml:assign` · `eml:augment` · `eml:augment` · `eml:output` · `eml:run:done`

## Reproduce via tools

`POST /ai/tools/interpret` with `{ "source": "x^+100\nx^+10\nx^*2\nx^0" }` → `output: "220\n"`.
