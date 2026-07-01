<!-- canonical_layer: aicl-capability | document: tools/tools | last_updated: 2026-07-01 -->

# EML Capability Layer

The **AICL Capability Layer** for this repository. EML tools are available two ways; both run the
same deterministic packages (`@eml/parser`, `@eml/transpiler-python`, `@eml/transpiler-eml`,
`@eml/interp`, `@eml/trace`). Machine-readable declaration: [`catalog.json`](./catalog.json).

## 1. Local CLI (`@eml/cli`)

```bash
eml run f.eml                       # transpile + execute via Python
eml transpile f.eml --target cpp    # EML -> Python, or the C++ prototype
eml trace f.eml --run               # phosphor-jsonl-v1 trace (+ interp==python check)
eml compress f.py                   # reverse: Python (subset) -> EML
eml roundtrip f.eml                 # EML -> Py -> EML -> Py fixpoint check
eml bugs f.eml --run                # classify errors (5 levels), mapped to source
```

## 2. Hosted HTTP tools (bounded)

Base: `https://efficientnewlanguage.org` · OpenAPI:
`https://efficientnewlanguage.org/ai/tools/openapi.json`

| Tool | Method | Path |
| --- | --- | --- |
| `eml.parse` | POST | `/ai/tools/parse` |
| `eml.transpile_python` | POST | `/ai/tools/transpile-python` |
| `eml.transpile_eml` | POST | `/ai/tools/transpile-eml` |
| `eml.interpret` | POST | `/ai/tools/interpret` |
| `eml.trace` | POST | `/ai/tools/trace` |
| `eml.roundtrip` | POST | `/ai/tools/roundtrip` |
| health | GET | `/ai/tools/health` |

```bash
curl -s https://efficientnewlanguage.org/ai/tools/transpile-python \
  -H 'content-type: application/json' \
  -d '{"source":"N^+100\nΣ(i^2, i in [1:N]) => r\nr^0"}'
```

## Bounds & safety

Bounded input (20000 chars); static resource limits (`max_exponent` 4096, `max_nesting_depth` 256,
`max_eval_steps` 2,000,000) — pathological programs are rejected with `E_RESOURCE_LIMIT`. No
arbitrary execution, filesystem, shell, or outbound network; deterministic (no LLM in the core).
Errors follow [`../specs/eml-error-schema.json`](../specs/eml-error-schema.json). Usage boundaries:
[`../governance/usage-policy.md`](../governance/usage-policy.md).
