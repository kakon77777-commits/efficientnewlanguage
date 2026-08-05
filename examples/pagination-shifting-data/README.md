# Pagination over shifting data — the skip nobody notices

`pagination_shifting_data.eml` walks a collection page by page with a row
inserted or deleted *before the window* between requests, under offset
pagination and keyset (cursor) pagination.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two failures from one cause, only one of which is
visible.

| mutation | offset pagination | keyset pagination |
| --- | --- | --- |
| insert before window | one row **duplicated** | clean |
| delete before window | one row **skipped** | clean |
| none | clean | clean |

Both properties — every stable row delivered at least once, and at most
once — are computed by collecting what the client actually received and
comparing against the set of rows that existed for the whole walk. A row
inserted mid-walk may or may not appear, and either is defensible, so it is
excluded from the comparison rather than counted as a failure.

The check that names the real problem is the last one: after a delete, the
page that skips a row **is still full**. Nothing about the response says
anything was lost — the page size is right, the ids are plausible, and the
missing item simply never appears.

The duplicate is annoying and visible; the skip is invisible and worse.

Verify it yourself:

```bash
pnpm eml run examples/pagination-shifting-data/pagination_shifting_data.eml
```

```bash
pnpm eml trace examples/pagination-shifting-data/pagination_shifting_data.eml --run
```
