# Case corpus: a self-authored library checkout catalog

`library_catalog.eml` is a class-based case in a self-authored batch of six
OOP utilities (alongside `examples/bank-account-simulator/`,
`examples/simple-stack/`, `examples/simple-queue/`,
`examples/inventory-tracker/`, and `examples/parking-lot-tracker/`) — part
of growing the EML case corpus toward AI-native training scale, not a port
of an existing project.

A `Library` class tracks checkout status for three sample books. It checks
one out, deliberately attempts to check it out again while it's still on
loan (catching the resulting error), returns it, checks out a different
title, and finally reports availability for the whole catalog.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict literal + subscript get/set through a `self`
attribute (`self.books`, title -> checked-out boolean), a parallel list of
titles grown via `existing + [item] => existing` for ordered iteration,
bare `True`/`False` literals bound through `=>` (as in
`examples/todo-list-manager/`), and `try`/`except`/`raise ValueError` for
checking out a book that is already checked out.

Verify it yourself:

```bash
pnpm eml transpile examples/library-catalog/library_catalog.eml   # -> Python
pnpm eml run examples/library-catalog/library_catalog.eml         # -> checkout/return trace + availability report
pnpm eml trace examples/library-catalog/library_catalog.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/library-catalog/library_catalog.eml   # -> OK (fixpoint)
```
