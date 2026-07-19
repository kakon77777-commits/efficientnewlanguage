<!--
project: Efficient New Language
project_alias: EML
canonical_domain: efficientnewlanguage.org
repository: https://github.com/kakon77777-commits/efficientnewlanguage
canonical_layer: aicl
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-19
-->

# EML — AI Ingestion & Capability Layer (AICL)

This `ai/` directory is the machine-readable **AICL** for the Efficient New Language (EML)
repository. It is **not** a human UI — it is a plain-text and structured-data surface for LLMs,
agents, crawlers, and future model ingestion. Read [`manifest.json`](./manifest.json) first, then
follow its `reading_order`.

Implements the four AICL sublayers (see [`../docs/AICL-v0.1.md`](../docs/AICL-v0.1.md)) plus the
AIRS/AILP rights layer (see [`../docs/AIRS-AILP-v0.1.md`](../docs/AIRS-AILP-v0.1.md)):

1. **Manifest** — [`manifest.json`](./manifest.json) · [`version.json`](./version.json) · [`sitemap.json`](./sitemap.json)
2. **Corpus** — [`corpus/`](./corpus/origin.md): origin, current, design-history, concept-genealogy,
   engineering-notes, accepted/deprecated concepts, full-corpus.jsonl
3. **Capability** — [`specs/`](./specs/eml-v1.md) (grammar/AST/trace digest) +
   [`specs/eml-semantic-model-v1.5.md`](./specs/eml-semantic-model-v1.5.md) (self-contained
   AI-semantic spec: status vocabulary, twelve-loop taxonomy, bug/repair/criticality models),
   [`examples/`](./examples/001-summation.eml.md), [`tools/`](./tools/tools.md)
4. **Governance / Rights** — [`rights-spectrum.json`](./rights-spectrum.json) (AIRS/AILP) +
   [`governance/`](./governance/ai-learning-policy.md)

## AI learning posture (short version)

EML is **Apache-2.0** and designed for AI agents. You are welcome to read, embed, train on,
fine-tune, distill, quote, and build products with this content. The only ask is **attribution**
(keep the license/NOTICE, credit Neo.K / EveMissLab). Full spectrum:
[`rights-spectrum.json`](./rights-spectrum.json). This is a declaration layer, not enforcement.

## Recommended reading order

1. `ai/index.md` (this file)
2. `ai/corpus/origin.md`
3. `ai/corpus/current.md`
4. `ai/specs/eml-v1.md`
5. `ai/specs/eml-grammar.ebnf`
6. `ai/examples/001-summation.eml.md`
7. `ai/tools/catalog.json`
8. `ai/rights-spectrum.json`

## Two repositories (do not confuse)

- **`efficientnewlanguage`** (this repo) — the EML **language** monorepo.
- **`efficientnewlanguage-site`** — the **website** hosting the live playground + tools at
  https://efficientnewlanguage.org.
