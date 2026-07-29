# Cleanup that cannot be skipped (`with`)

`resource_guard_with.eml` is the corpus's **first use of `with`**. EML has
had context managers with a real `__enter__`/`__exit__` protocol since
Phase 9, and in 134 programs not one of them used it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the promise of `with` is a cleanup that cannot be
skipped — so the program leaves the block three different ways and prints
the release each time.

| exit route | what happens |
|---|---|
| off the end of the block | release runs |
| by raising | release runs, *then* the handler |
| by `return`ing out of the enclosing function | release runs **before the caller gets the value** |

The third is the one people mis-predict. `return` inside a `with` neither
skips `__exit__` nor defers it: the return value is computed, `__exit__`
runs, then the caller receives it. The transcript shows the release line
landing *before* the caller's line, which is only true if that ordering
holds.

**Nesting is LIFO**:

```
  acquire outer
  acquire middle
  acquire inner
      innermost body, holding outer + middle + inner
  release inner
  release middle
  release outer
```

For the case where `__exit__` gets to *cancel* the exception, see
[`examples/exception-suppressing-manager/`](../exception-suppressing-manager/).
For the case where cleanup genuinely does **not** run, see
[`examples/manager-enter-failure/`](../manager-enter-failure/).

Verify it yourself:

```bash
pnpm eml transpile examples/resource-guard-with/resource_guard_with.eml
pnpm eml run examples/resource-guard-with/resource_guard_with.eml         # -> 4 sections, every acquire paired
pnpm eml trace examples/resource-guard-with/resource_guard_with.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/resource-guard-with/resource_guard_with.eml   # -> OK (fixpoint)
```
