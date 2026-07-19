# Case corpus: a self-authored parking lot tracker

`parking_lot_tracker.eml` is a class-based case in a self-authored batch of
six OOP utilities (alongside `examples/bank-account-simulator/`,
`examples/simple-stack/`, `examples/simple-queue/`,
`examples/inventory-tracker/`, and `examples/library-catalog/`) — part of
growing the EML case corpus toward AI-native training scale, not a port of
an existing project.

A `ParkingLot` class manages a fixed 5-slot lot. It parks a realistic
sequence of vehicles, has one leave and a later vehicle take its freed
slot, fills every remaining slot, and finally attempts to park one more car
than the lot can hold — catching the resulting error instead of crashing.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `class` + `self` attribute list state (`self.slots`,
a fixed-size list of booleans), a `for` loop whose range upper bound is a
full expression built from a `self` attribute
(`[0 : self.capacity - 1]`, the same idiom as
`examples/todo-list-manager/`'s `[0 : len(self.tasks) - 1]`), a `return`
from inside a `for` loop, and `try`/`except`/`raise ValueError` for parking
in a full lot.

Verify it yourself:

```bash
pnpm eml transpile examples/parking-lot-tracker/parking_lot_tracker.eml   # -> Python
pnpm eml run examples/parking-lot-tracker/parking_lot_tracker.eml         # -> parking/leaving trace
pnpm eml trace examples/parking-lot-tracker/parking_lot_tracker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/parking-lot-tracker/parking_lot_tracker.eml   # -> OK (fixpoint)
```
