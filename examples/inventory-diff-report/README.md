# Difference is directional

`inventory_diff_report.eml` — reconciles two stock snapshots.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: difference in both directions, and reporting a set without printing it.

`now - before` and `before - now` are different questions; a single call
cannot answer both, and reporting only one is a classic reconciliation bug.

The report never prints a set directly. CPython renders a set in hash order
while this interpreter stores insertion order, so `str(a_set)` would produce a
different line here than in the program's own Python projection. Printing a
multi-element set therefore defers; to report one, walk a list the program
controls and test membership.

Verify it yourself:

```bash
pnpm eml run examples/inventory-diff-report/inventory_diff_report.eml
pnpm eml trace examples/inventory-diff-report/inventory_diff_report.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/inventory-diff-report/inventory_diff_report.eml   # -> OK (fixpoint)
```
