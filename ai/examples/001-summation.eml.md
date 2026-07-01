<!-- canonical: efficientnewlanguage.org/ai/examples/001-summation | ai_layer_version: 0.1.0 | updated: 2026-06-30 -->

# Example 001 — Summation (Σ) over an inclusive range

The canonical EML demo: an algebraic-sum intent compressed into one symbol.

## EML

```eml
N^+100
Σ(i^2, i in [1:N]) => r
r^0
```

## Python (deterministic transpilation)

```python
N = 100
r = sum(i**2 for i in range(1, N+1))
print(r)
```

## stdout (executed)

```text
338350
```

## Round-trip

`ok: true` — round-trip fixpoint reached (`python1 == python2`).

## Trace (phosphor-jsonl-v1)

```jsonl
{"stream":"eml","proto":"phosphor-jsonl-v1","seq":1,"type":"eml:run:start","statements":3}
{"stream":"eml","proto":"phosphor-jsonl-v1","seq":2,"type":"eml:assign","name":"N","value":"100","declares":true}
{"stream":"eml","proto":"phosphor-jsonl-v1","seq":3,"type":"eml:sum","iterator":"i","count":100,"result":"338350"}
{"stream":"eml","proto":"phosphor-jsonl-v1","seq":4,"type":"eml:assign","name":"r","value":"338350","declares":true}
{"stream":"eml","proto":"phosphor-jsonl-v1","seq":5,"type":"eml:output","text":"338350"}
{"stream":"eml","proto":"phosphor-jsonl-v1","seq":6,"type":"eml:run:done","ok":true,"outputs":1,"anomalies":0}
```

(Live traces also carry `ts` and `mono`; consumers MUST treat them as optional.)

## Reproduce via tools

`POST /ai/tools/trace` with `{ "source": "N^+100\nΣ(i^2, i in [1:N]) => r\nr^0" }`.
