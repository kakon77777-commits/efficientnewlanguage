# Deleted row survives in derived copies — the delete succeeded against the one surface nobody searches

`deleted_row_survives_in_derived_copies.eml` deletes a record and then
interrogates each surface the way a user reaches it, reporting which ones still
return content. It also runs the deletion audit the system has.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a delete is written against the store that owns the
record, and it succeeds. Every derived structure built from that store holds
its own copy — because joining back to the store on every render was too slow,
and the denormalisation was the fix.

| surface | still returns the record | what a user sees |
| --- | --- | --- |
| store | **False** | (needs the id anyway) |
| search index | **True** | Severance agreement |
| autocomplete | **True** | severance |
| recent list | **True** | Severance agreement |

```
surfaces checked: 4
surfaces still returning the record: 3
of those, returning readable CONTENT: 3
```

Not a dangling id — a **title**. An id that resolves to nothing is a broken
link; a title is a disclosure.

The audit the system has:

```
record absent from the store: PASS
```

It asks the store, because the store is the thing the delete was issued
against. An audit that asks the surfaces instead reports FAIL on the same data
at the same instant.

The asymmetry that matters is about who each surface serves. The store is
reachable only if you already know `d-2`. The search index is reachable by
typing a word from the title — which is the exact population a deletion is
usually meant to protect the record from.

Verify it yourself:

```bash
pnpm eml run examples/deleted-row-survives-in-derived-copies/deleted_row_survives_in_derived_copies.eml
```
