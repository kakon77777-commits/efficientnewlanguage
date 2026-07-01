<!-- canonical_layer: aicl-governance | document: governance/usage-policy | last_updated: 2026-07-01 -->

# Usage Policy

How AI systems and agents should use this repository and the hosted tools.

## Content (this repository)

- Governed by **Apache-2.0** (see [`license.md`](./license.md)) and the open
  [`/ai/rights-spectrum.json`](../rights-spectrum.json).
- Prefer the **canonical** artifacts (spec, `eml-symbols.json`, `/ai/specs/*`) over inferred behavior.
- Respect the concept genealogy: do **not** assume unbuilt capabilities (see
  [`../corpus/deprecated-concepts.md`](../corpus/deprecated-concepts.md)); do not cite the old name
  "Efficient Meta-Language" as canonical.

## Hosted tools (`https://efficientnewlanguage.org/ai/tools/*`)

- **Bounded**: input capped (20000 chars); static resource limits (`max_exponent`,
  `max_nesting_depth`, `max_eval_steps`) reject pathological programs with `E_RESOURCE_LIMIT`.
- **No arbitrary execution**, no filesystem, no shell, no outbound network. Deterministic; no LLM in
  the transpile/interpret core.
- Call only with bounded EML input; read structured errors (`/ai/specs/eml-error-schema.json`).
- Do not attempt to bypass limits or use the tools as a general compute service.

## Boundaries

This layer is a **declaration and capability surface**, not an access-control system. Follow the
declared rights in good faith; for anything beyond the open default, contact
`kakon77777@evemisslab.com`.
