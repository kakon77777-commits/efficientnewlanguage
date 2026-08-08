# Count leaks hidden items — the rows were filtered and the total was not

`count_leaks_hidden_items.eml` pages through a listing as four viewers,
compares what the header claims against what the pages deliver, and then runs
the attack that difference enables.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: visibility is enforced where the rows are rendered,
because that is obviously where "which rows can this viewer see" belongs. The
total is computed from the query, because that is obviously where counting
belongs. Both are correct in isolation.

| viewer | filter | header says | rows delivered | gap |
| --- | --- | --- | --- | --- |
| eng | * | 7 | 4 | 3 |
| hr | * | 7 | 5 | 2 |
| hr | hr | 3 | 3 | **0** |
| sales | * | 7 | 3 | **4** |

8 listings, of which the header over-claims on **7**. Rows rendered that the
viewer may not see: **0**.

That second number is the point. Nothing leaks a row. What leaks is the
*difference between two numbers*, and the viewer computes it without seeing
anything they are not allowed to see:

| department probed by an outsider | rows shown | total reported | restricted rows deduced |
| --- | --- | --- | --- |
| eng | 2 | 3 | 1 |
| hr | 1 | 3 | 2 |
| legal | 0 | 1 | 1 |
| sales | 0 | 0 | 0 |

Sharpened into a yes/no oracle: the header confirms the existence of **4 of 4**
hidden records to an outsider. Not some — a count is total, so the oracle is
total.

Paging terminates against the header's number, which is why an honest client
cannot distinguish "I am missing rows" from "I have reached the end".

Access control was applied to the rows and not to the aggregate, because an
aggregate does not look like data. It is: a count is a projection of the same
records, and projecting a record you may not read is reading it at lower
resolution.

Verify it yourself:

```bash
pnpm eml run examples/count-leaks-hidden-items/count_leaks_hidden_items.eml
```
