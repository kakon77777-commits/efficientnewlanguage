# Cache eviction policy — the workload decides, not the policy

`cache_eviction_policy.eml` runs LRU, LFU and FIFO over three access traces
chosen because each defeats a different policy, and compares all three
against the offline (Belady) optimum.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: policies are usually compared by hit rate on "a
typical workload", which is a phrase doing all the work. The three traces:

| trace | what it does |
| --- | --- |
| looping | a cycle slightly longer than the cache — LRU evicts exactly the item it is about to need |
| frequency | a few hot keys among many cold ones — FIFO throws hot keys out on schedule |
| recency | a working set that moves — LFU keeps yesterday's hot keys forever |

The headline measurement is that **LRU hits zero** on the looping trace,
and that **the winner differs across traces** — a distinct-winners count
above 1 is a check, so a future change that produced a single dominant
policy would fail rather than look like an improvement.

The Belady optimum is computed by looking at the future, which no online
policy can do, so it is a bound rather than a competitor. Two checks pin
it: it must be at least as good as every online policy on every trace, and
strictly better somewhere — otherwise it is not a meaningful bound.

LRU hitting zero on a loop is not a defect in LRU. It is LRU doing exactly
what it promises, on a pattern that punishes the promise.

Verify it yourself:

```bash
pnpm eml run examples/cache-eviction-policy/cache_eviction_policy.eml
```

```bash
pnpm eml trace examples/cache-eviction-policy/cache_eviction_policy.eml --run
```
