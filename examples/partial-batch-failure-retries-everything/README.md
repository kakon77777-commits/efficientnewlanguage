# Partial batch failure retries everything — one record that can never succeed rewrote every record that already had

`partial_batch_failure_retries_everything.eml` sends six records — one of them
permanently bad — through three writers, and counts what the store holds
afterwards plus how many records were delivered more than once.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the endpoint reports per record and the caller retries
per batch, so the unit of failure and the unit of recovery disagree by exactly
the batch size.

| writer | stored | deliveries | duplicates | stuck | calls |
| --- | --- | --- | --- | --- | --- |
| retry whole batch | **14** | 14 | **9** | 1 | 3 |
| retry failed only | 5 | 5 | **0** | 1 | 3 |
| retry whole, idempotent | 5 | 14 | **9** | 1 | 3 |

Read the third row. Idempotence fixes the **store** — 5 rows, correct — and
does nothing about the **traffic**: 14 deliveries, 9 of them duplicates. Those
calls still leave, still cost, still consume rate limit, and are still counted
by whatever sits downstream of the endpoint rather than inside it.

The blast radius is the batch size, measured by varying it:

```
1 good + 1 poison -> duplicate deliveries: 2
3 good + 1 poison -> duplicate deliveries: 6
5 good + 1 poison -> duplicate deliveries: 10
```

The poison record stays stuck under all three writers, so the difference is not
about eventually succeeding — it is about what happens to the innocent records
sharing its batch.

Verify it yourself:

```bash
pnpm eml run examples/partial-batch-failure-retries-everything/partial_batch_failure_retries_everything.eml
```
