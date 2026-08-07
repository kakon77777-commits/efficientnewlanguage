# Cost model mismatch — a limit of 100 items, and the resource is bytes

`cost_model_mismatch.eml` runs four workloads through a count limit, a byte
limit, and a combined limit, and reports the **maximum** bytes admitted under
each.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: every limit has two units — the one it counts in and the
one the resource runs out in — and when they differ, the conversion is supplied
by the caller.

| workload | item bytes | count limit | byte limit |
| --- | --- | --- | --- |
| fixture | 100 | 50 / 5000 | 50 / 5000 |
| tiny | 10 | 100 / 1000 | 200 / 2000 |
| typical | 100 | 100 / 10000 | 200 / 20000 |
| heavy | 50000 | 100 / **5000000** | 2 / 100000 |

Maximum bytes admitted: the count limit lets **5,000,000** through against a
100,000-byte budget — 50× over. Both byte-aware limits bound it exactly.

**The observable was wrong first.** The initial version reported the *spread*
of bytes admitted and treated a wide spread as failure. The byte limit has a
50× spread and is working perfectly — small workloads simply never reach the
cap. A limit's job is to bound the maximum, not to make the amount constant.
The measurement was real and answered a different question.

The control is the small fixture batch, where nothing binds and all three modes
agree exactly. The typical batch is large enough that they diverge — so the
fixture's silence is a property of its **size**, not of the data being
ordinary.

Verify it yourself:

```bash
pnpm eml run examples/cost-model-mismatch/cost_model_mismatch.eml
```
