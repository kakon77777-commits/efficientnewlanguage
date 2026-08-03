# A label that looked like it had five values

`metric_cardinality_explosion.eml` counts the time series each labelling produces and compares them against what the label domains predict.

**What it exercises**: `endpoint` is bounded until a path contains an id.
`/users/17/orders` and `/users/99/orders` are two endpoints to a metrics
system and one to a person, and nothing about the label's type says
which. Predicted 20 series; observed **240**.

Which label is unbounded is a fact about the **data**, so the diagnosis
is a measurement, not a reading of the schema: distinct values are
counted at two traffic volumes and the ones that grow are flagged.
`method` and `status` hold at 4 and 5; `user` and `path` go 80 → 240.

Templating digit segments collapses the endpoint label back to the
predicted size and leaves the method/status breakdown intact — checked,
because a fix that also destroys the distinction it was keeping is not a
fix.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  templ.   1     1     bounded

series to store, one counter each:
  with raw path:        240
  with raw path + user: 240
  with templated path:  20
...and every one of them is retained for the full retention window.

checks passed: 5/5
Two labels grow with traffic. The schema says nothing about which.

Whether a label is bounded is a fact about the DATA, and the only reliable
way to learn it is to count distinct values as traffic grows - which is a
measurement nobody runs, because the label was added to answer a question,
not to be studied. `method` and `endpoint` have the same type and one of
them is a time bomb.
```
