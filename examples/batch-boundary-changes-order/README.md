# Batch boundary changes order — every batch was handled correctly and the answer was wrong

`batch_boundary_changes_order.eml` runs the same sort-and-dedup pipeline at
seven batch sizes over twelve records and compares each result against the
batch-free answer.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: batch size is introduced as a performance parameter and
silently becomes the width of every comparison the job is able to make.

| op | batch | matches the batch-free answer |
| --- | --- | --- |
| sort | 3 | **False** |
| sort | 6 | **False** |
| sort | 12 | True |
| dedup | 3 | **False** |
| dedup | 6 | **False** |
| dedup | 12 | True |

14 runs, **10** disagreeing. Both operations first become correct at batch size
**12** — which is the input length.

The mechanism, counted rather than described:

| batch | pairs of records that ever land in the same batch |
| --- | --- |
| 1 | 0 of 66 |
| 3 | 12 of 66 |
| 6 | 30 of 66 |
| 12 | **66 of 66** |

Two records in different batches are never in the same list, so no within-batch
operation can relate them, whatever the operation is.

And the operations themselves are not buggy:

```
batch 3: 4/4 batches internally sorted, whole output sorted: False
```

Every batch is correct on the list it was given. Nothing in a list says it is a
fragment. The fixture that would catch this has to be **longer than the batch**,
and fixtures are small on purpose.

Verify it yourself:

```bash
pnpm eml run examples/batch-boundary-changes-order/batch_boundary_changes_order.eml
```
