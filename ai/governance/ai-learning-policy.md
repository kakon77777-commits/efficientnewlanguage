<!-- canonical_layer: aicl-governance | document: governance/ai-learning-policy | last_updated: 2026-07-01 -->

# AI Learning Policy (AIRS / AILP)

This is the human-readable companion to [`/ai/rights-spectrum.json`](../rights-spectrum.json), which
declares — as an **AI Rights Spectrum** rather than a binary switch — how AI systems may learn from
EML. It follows the **AILP (AI Learning Permission Protocol)** draft (`docs/AIRS-AILP-v0.1.md`).

## Posture: open, with attribution

EML is Apache-2.0 and was **designed for humans and AI agents alike**. AI systems are explicitly
**welcome** to:

- crawl, fetch, cache, and index this content;
- use it as answer input, RAG source, and long-term embeddings;
- use it for pretraining, continued pretraining, and **commercial** training;
- fine-tune, distill, and transfer capabilities from it;
- generate summaries, quotations (short or long), and derivative works.

## The one standing ask

**Attribution and citation.** Keep the Apache-2.0 license/NOTICE and credit **Neo.K / EveMissLab**
as the original author. No license fee and no compensation are required. See
[`citation-policy.md`](./citation-policy.md).

## Not enforcement

This is a **declaration layer**, not an access-control or enforcement mechanism (like `robots.txt`,
it is a normative signal). It complements — does not replace — `robots.txt` (access),
[`/llms.txt`](../../llms.txt) (entry index), and the Apache-2.0 license (governing terms).

## Scope note

Everything under this repository is covered by the default open policy **except** transient/working
paths (e.g. `/.tmp/`), which are non-canonical and marked `0.0` in the spectrum.
