# Percentile composition — every backend meets its p99, one request in ten is slow

`percentile_composition.eml` computes the p99 of a request that fans out to N
backends and waits for all of them, exactly, with no simulation.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a request waiting on N backends takes the **maximum** of
N latencies. If each is slow with probability 1%, the request is fast only when
all N are fast.

| fan-out | request within the backend p99 | request p99 | vs one backend |
| --- | --- | --- | --- |
| 1 | 99.0% | 929 ms | 100% |
| 2 | 98.0% | 1686 ms | 181% |
| 5 | 95.0% | 3353 ms | 360% |
| 10 | **90.4%** | 5020 ms | **540%** |
| 20 | 81.7% | 10020 ms | 1078% |

Every backend meets its stated target in all of those rows.

Stated the useful way round: **to hold a ten-way fan-out at p99, the backend
must be controlled at p99.9** — its 1-in-1000 tail, not its 10-in-1000 tail.

**The measurement is exact rather than simulated.** The backend distribution is
1000 quantiles given by a formula, so `P(max of N ≤ the k-th value)` is
`(k/1000)^N`, and the smallest k meeting a target is found by binary search
with the comparison done as `k^N · 1000 ≥ target · 1000^N` — big integers, no
floating point anywhere in the decision. A final check re-derives the same k by
a direct scan, so the exactness claim rests on two implementations.

**On the distribution's shape**: the first version used a polynomial tail,
which is nearly flat at the top — the required quantile moved from p99 to p99.9
while the milliseconds moved 1%, so the table understated its own finding. A
real latency tail grows like `1/(1-p)`, which is what it uses now.

Verify it yourself:

```bash
pnpm eml run examples/percentile-composition/percentile_composition.eml
```

```bash
pnpm eml trace examples/percentile-composition/percentile_composition.eml --run
```
