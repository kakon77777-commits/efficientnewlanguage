# Cache stampede — the hotter the key, the bigger the crowd at expiry

`cache_stampede_single_flight.eml` replays one arrival pattern across expiry
boundaries under four policies and counts three costs separately:
recomputations, requests that **waited**, and requests served **stale**.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a TTL is a synchronisation point nobody meant to create
— it makes every reader of a key miss at the same instant.

| policy | recomputes | waited | served stale |
| --- | --- | --- | --- |
| naive | **32** | 32 | 0 |
| single-flight | 2 | 32 | 0 |
| early refresh | 3 | 24 | 0 |
| serve-stale | 2 | **0** | **32** |

A 16× stampede for a value that changes three times. No policy is zero on all
three counters — those are the three things that can be given up, and a cache
exists because at least one of them has to be.

**Two premises the measurement corrected.** The naive policy originally set
freshness on the first miss, which is single-flight with zero latency: it gave
the naive policy the exact behaviour the case exists to say it lacks, and made
it look *better* than single-flight. And the closing claim — that a serial load
test cannot produce a stampede — is false. One request per tick still stampedes,
because the compute window is four ticks wide.

The corrected claim is sharper and swept rather than assumed:

```
  gap 1   naive 4    single-flight 1
  gap 4   naive 4    single-flight 4
the two agree once the gap reaches: 4 ticks
recompute takes: 4 ticks
```

The stampede exists whenever requests arrive **faster than the recomputation
finishes** — which is the definition of a value worth caching.

Verify it yourself:

```bash
pnpm eml run examples/cache-stampede-single-flight/cache_stampede_single_flight.eml
```
