# Partitioned queue ordering — the order you routed on, and no other

`partitioned_queue_ordering.eml` routes a stream of related events through
1 to 6 partitions and counts two different kinds of ordering violation:
within a partition key, and across keys.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: an assumption that is never written down because it
is not a belief about the queue — it is a belief about two events that are
related in the domain and unrelated to the router.

| partition counts tried | per-key order held |
| --- | --- |
| 6 | 6/6 |

Per-key order holds at every partition count. Every global inversion that
appears is a **cross-key** one — which is the precise statement of what
partitioning bought: order within a key, nothing between keys. The output
names a concrete instance:

```
order #2 was produced before ship #4, delivered after
```

The single-partition baseline is the control: **global inversions 0, and no
parallelism at all** — the ordering everyone wants and the throughput
nobody accepts.

Verify it yourself:

```bash
pnpm eml run examples/partitioned-queue-ordering/partitioned_queue_ordering.eml
```

```bash
pnpm eml trace examples/partitioned-queue-ordering/partitioned_queue_ordering.eml --run
```
