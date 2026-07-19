# Case corpus: a self-authored FIFO queue

`simple_queue.eml` is a class-based case in a self-authored batch of six OOP
utilities (alongside `examples/bank-account-simulator/`,
`examples/simple-stack/`, `examples/inventory-tracker/`,
`examples/library-catalog/`, and `examples/parking-lot-tracker/`) — part of
growing the EML case corpus toward AI-native training scale, not a port of
an existing project.

A `Queue` class implements a first-in-first-out queue over a plain list. It
enqueues three sample people, then dequeues them in the same order they
arrived, printing who's served at each step.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `class` + `self.items` list state grown via
`existing + [item] => existing` (no `.append()` builtin — not modeled by
the interpreter), and a manual dequeue implementation: reading index 0,
then reassigning `self.items[1 : len(self.items)] => self.items` to drop
the front element (no `.pop(0)` builtin either).

Verify it yourself:

```bash
pnpm eml transpile examples/simple-queue/simple_queue.eml   # -> Python
pnpm eml run examples/simple-queue/simple_queue.eml         # -> enqueue/dequeue trace
pnpm eml trace examples/simple-queue/simple_queue.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/simple-queue/simple_queue.eml   # -> OK (fixpoint)
```
