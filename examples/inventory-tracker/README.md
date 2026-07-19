# Case corpus: a self-authored stock inventory tracker

`inventory_tracker.eml` is a class-based case in a self-authored batch of
six OOP utilities (alongside `examples/bank-account-simulator/`,
`examples/simple-stack/`, `examples/simple-queue/`,
`examples/library-catalog/`, and `examples/parking-lot-tracker/`) — part of
growing the EML case corpus toward AI-native training scale, not a port of
an existing project.

An `Inventory` class tracks stock levels for a small set of warehouse
products (a USB-C cable and a wireless mouse). It restocks, sells down, and
then deliberately tries to remove more units than are on hand, catching the
resulting error before printing a final stock report.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict literal + subscript get/set through a `self`
attribute (`self.stock`, product name -> quantity), `in` membership on a
dict, a parallel list of keys grown via `existing + [item] => existing` for
ordered reporting (the same dict + key-list idiom as
`examples/word-frequency-counter/`'s `counts` + `unique_words`), and
`try`/`except`/`raise ValueError` for an insufficient-stock removal.

Verify it yourself:

```bash
pnpm eml transpile examples/inventory-tracker/inventory_tracker.eml   # -> Python
pnpm eml run examples/inventory-tracker/inventory_tracker.eml         # -> stock report
pnpm eml trace examples/inventory-tracker/inventory_tracker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/inventory-tracker/inventory_tracker.eml   # -> OK (fixpoint)
```
