# Aggregates that do not decompose — four survived partitioning, three did not, and the call sites are identical

`aggregates_that_do_not_decompose.eml` computes seven aggregates over sixteen
values both whole and per-partition, at three partition sizes, and reports which
ones agree at every size.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "compute it per shard and merge" is a statement about
**associativity**, written as a statement about performance.

| aggregate | whole | part(2) | part(4) | part(8) | agrees everywhere |
| --- | --- | --- | --- | --- | --- |
| sum | 78 | 78 | 78 | 78 | ✅ |
| count | 16 | 16 | 16 | 16 | ✅ |
| max | 9 | 9 | 9 | 9 | ✅ |
| min | 1 | 1 | 1 | 1 | ✅ |
| **median** | 5 | 8 | 7 | 7 | ❌ |
| **distinct** | 9 | 16 | 16 | 14 | ❌ |
| **mode** | 3 | 3 | 1 | 1 | ❌ |

Every aggregate is correct at a single partition, so the defect is
partitioning, not the aggregate. `distinct` is **over**counted, because each
partition counts its own copies.

The reason this survives review — each broken result checked against the
yardstick appropriate to *its* aggregate:

```
median      partitioned(4) = 7,  yardstick [1..9]  -> plausible
distinct    partitioned(4) = 16, yardstick [1..16] -> plausible
mode        partitioned(4) = 1,  yardstick [1..9]  -> plausible
```

**A wrong premise, kept in the file.** That section first checked every broken
aggregate against `[min(DATA), max(DATA)]` and duly reported distinct-count as
*outside* the range. That was a category error: a median and a mode are values
drawn from the data, so the data's range is their yardstick; a **count** is not
a value from the data, and its yardstick is `[1, len]`. Measured against the
right bound, the wrong distinct-count of 16 says exactly "every row was unique"
— the most ordinary thing a distinct-count could say. The sharper claim is the
one that survived: all three wrong answers pass a sanity check, and a sanity
check is the only thing anybody runs.

Verify it yourself:

```bash
pnpm eml run examples/aggregates-that-do-not-decompose/aggregates_that_do_not_decompose.eml
```
