# Soft delete and uniqueness — the row is gone and the address is taken

`soft_delete_and_uniqueness.eml` runs sign-ups, deletions and re-sign-ups
against four schemes and counts two errors separately: registrations **wrongly
refused**, and duplicate **active** accounts wrongly allowed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a soft delete changes what a row *means* without
changing what it *is*, and every constraint was written against what it is.

| scheme | wrongly refused | duplicate active | deleted rows keeping the address |
| --- | --- | --- | --- |
| naive | 3 | 0 | 1 |
| partial index | 1 | 0 | 2 |
| null the field | 1 | 0 | **0** |
| compound key | 1 | 0 | 2 |

Only the partial index enforces the intended rule — at most one **active**
account per address — refusing exactly the one genuine duplicate.

**A modelling error the checks caught.** The first version implemented "null
the field" as a *key* transformation, which made it behave identically to the
compound key and kept the history it is supposed to destroy. Nulling is a
**data** change; that is precisely why it costs the audit trail. The check for
lost history is what said the model was wrong rather than the scheme.

The compound key trades one collision for another: two rows deleted in the
same instant produce identical keys, so the **second deletion** fails — a
failure moved into the audit path, where nobody tests.

And the control: with no deletions anywhere, all four schemes behave
identically — which is every test that does not delete something and try again.

Verify it yourself:

```bash
pnpm eml run examples/soft-delete-and-uniqueness/soft_delete_and_uniqueness.eml
```
