# Dedup key merges distinct records — both curves rose, and one was being watched

`dedup_key_merges_distinct_records.eml` sweeps four key definitions from strict
to loose over seven records carrying ground-truth entity ids, and scores each
key on duplicates joined, strangers joined, and duplicates missed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dedup key is a *hypothesis* about identity, stored as
a fact. It is deliberately lossy — that is what makes it find the duplicates an
exact match misses.

| level | distinct keys | duplicates joined | strangers joined | duplicates missed |
| --- | --- | --- | --- | --- |
| 0 (exact) | 7 | 0 | **0** | 2 |
| 1 | 5 | 1 | 2 | 1 |
| 2 | 3 | 2 | 4 | 0 |
| 3 (loosest) | 3 | **2** | **4** | 0 |

Loosening the key genuinely works: duplicates found go 0 → 2, missed go 2 → 0.
It also joins strangers 0 → 4. **Neither curve ever falls** — measured over
every loosening, not asserted. The visible metric is a ratchet, which is why
tuning always looks like progress.

The pigeonhole floor, computed before any record is examined:

```
level 0: 7 keys for 5 entities -> no collision forced
level 1: 5 keys for 5 entities -> no collision forced
level 2: 3 keys for 5 entities -> at least 2 entities forced to share
level 3: 3 keys for 5 entities -> at least 2 entities forced to share
```

At level 2 the merges stop being a data-quality problem. The key space the data
occupies is smaller than the number of entities present, so some entities
*must* collide no matter how clean the input is.

Who gets merged at the loosest level: `Jing Wu (e1)` with `Jian Wu (e2)`, and
two different `Ana Diaz` at the same address.

The output of a dedup job is a smaller file, and a smaller file is the thing
that was wanted. The records that vanish wrongly are exactly the ones who look
most like somebody else.

Verify it yourself:

```bash
pnpm eml run examples/dedup-key-merges-distinct-records/dedup_key_merges_distinct_records.eml
```
