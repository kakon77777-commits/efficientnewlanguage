# Case corpus: a self-authored LIFO stack

`simple_stack.eml` is a class-based case in a self-authored batch of six OOP
utilities (alongside `examples/bank-account-simulator/`,
`examples/simple-queue/`, `examples/inventory-tracker/`,
`examples/library-catalog/`, and `examples/parking-lot-tracker/`) — part of
growing the EML case corpus toward AI-native training scale, not a port of
an existing project.

A `Stack` class implements a last-in-first-out stack over a plain list. It
pushes three sample items on, then pops them back off one at a time,
printing the stack's contents at each step.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `class` + `self.items` list state grown via
`existing + [item] => existing` (no `.append()` builtin — not modeled by
the interpreter), and a manual pop implementation: reading the last element
via `self.items[len(self.items) - 1]`, then reassigning
`self.items[0 : len(self.items) - 1] => self.items` to drop it (no `.pop()`
builtin either).

Verify it yourself:

```bash
pnpm eml transpile examples/simple-stack/simple_stack.eml   # -> Python
pnpm eml run examples/simple-stack/simple_stack.eml         # -> push/pop trace
pnpm eml trace examples/simple-stack/simple_stack.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/simple-stack/simple_stack.eml   # -> OK (fixpoint)
```
