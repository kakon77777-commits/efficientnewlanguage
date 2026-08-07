# Retry amplification — three retries at three layers is twenty-seven

`retry_amplification.eml` computes the bottom-layer request count for every
combination of depth and per-layer attempts, and compares retrying at every
layer against retrying at the edge only.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: retry policies compose by **multiplication** and are
reviewed by addition.

| depth | retry every layer | retry at the edge only |
| --- | --- | --- |
| 1 | 3 | 3 |
| 2 | 9 | 3 |
| 3 | **27** | 3 |
| 5 | **243** | 3 |

Reviewed one layer at a time, every author sees a true statement — "this layer
sends at most 3 requests for each one it receives" — and nobody is looking at
the product, because the product is not visible from inside any single layer.

Against a backend at 25% utilisation (4× headroom), retrying at every layer
breaches at **depth 2**, shallower than any real service, while edge-only never
breaches at **any** depth.

**A premise the measurement corrected**: the first version used 2× headroom and
reported a breach at depth 1 — a true number answering the wrong question. At
2×, a single retrying layer already breaches, so the comparison says nothing
about composition, which is the subject. The generous headroom is what makes
the contrast measure what it claims to.

At depth 1 the two policies are identical, so the difference is entirely about
composition and not about retrying being bad.

Verify it yourself:

```bash
pnpm eml run examples/retry-amplification/retry_amplification.eml
```
