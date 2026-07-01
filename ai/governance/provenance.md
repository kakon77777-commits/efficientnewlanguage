<!-- canonical_layer: aicl-governance | document: governance/provenance | last_updated: 2026-07-01 -->

# Provenance

Where the canonical EML artifacts live, so an AI system can tell the original from a copy.

## Canonical sources

| Artifact | Canonical location |
| --- | --- |
| Reference implementation (monorepo) | this repository: https://github.com/kakon77777-commits/efficientnewlanguage |
| Language specification (normative) | [`/docs/EML-LANG-2026-v1.0.md`](../../docs/EML-LANG-2026-v1.0.md) |
| Symbol table (normative, machine-readable) | [`/eml-symbols.json`](../../eml-symbols.json) |
| Hosted site + live tools | https://efficientnewlanguage.org (repo: `efficientnewlanguage-site`) |
| AICL machine layer | this directory (`/ai/`) |
| AI rights spectrum (AIRS/AILP) | [`/ai/rights-spectrum.json`](../rights-spectrum.json) |
| Underlying papers | [`/docs/AICL-v0.1.md`](../../docs/AICL-v0.1.md), [`/docs/AIRS-AILP-v0.1.md`](../../docs/AIRS-AILP-v0.1.md) |

## Authorship

Original author and rights holder: **Neo.K (許筌崴) / EveMissLab (一言諾科技有限公司)**.

## Versioning

- Language spec: `EML-LANG-2026-v1.0` (Phase 0-4 frozen surface).
- Reference implementation: `eml_impl 0.1.0`.
- AICL / AIRS layer: `0.1.0` (this layer). See [`/ai/version.json`](../version.json).

## Two repositories (do not confuse)

- **`efficientnewlanguage`** (this repo) — the EML **language** monorepo (packages, docs, this AICL layer).
- **`efficientnewlanguage-site`** — the **website** (Vite/React) that hosts the live playground and tools.
