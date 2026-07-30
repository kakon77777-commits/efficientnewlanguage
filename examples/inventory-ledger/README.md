# A dict iterates in insertion order

`inventory_ledger.eml` compares stock levels against reorder floors and
prints a report by walking the dict.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `for key in <dict>`, subscript lookup against a
second dict, and order-free aggregation with `sum`/`min`/`max`.

Since Python 3.7 a dict iterates in **insertion order**, and that is a
language guarantee rather than an implementation accident. So a report
built by walking a dict comes out in the order entries were added — not in
a hash order that could differ between runs.

```
Below floor: 2 of 4
Units to order: 44
Report order is insertion order:
  bolts washers nuts screws
```

Sets make the opposite choice; see `examples/unique-tag-collector`.

## Why this case exists

`for key in <dict>` **did not work** until this program was written. The
interpreter's loop accepted only list, tuple and str, and raised TypeError
on a dict where Python iterates the keys.

It went unnoticed because every earlier corpus program that used a dict
subscripted it rather than iterating it — the gap was in a shape nobody
had written, not in a feature nobody had implemented.

Verify it yourself:

```bash
pnpm eml run examples/inventory-ledger/inventory_ledger.eml
pnpm eml trace examples/inventory-ledger/inventory_ledger.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/inventory-ledger/inventory_ledger.eml   # -> OK (fixpoint)
```
