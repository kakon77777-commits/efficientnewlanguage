# When cleanup does *not* run

`manager_enter_failure.eml` covers the context-manager rule almost nobody
states, and the one that decides whether "cleanup always runs" is
actually true.

**It isn't.** `with` guarantees `__exit__` runs if the block was
**entered**. If `__enter__` raises, there is no block and no `__exit__`
call — the manager never finished setting itself up, and asking it to
tear down a half-built thing would be worse than not asking.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

```
A. __enter__ succeeds        enters=1 exits=1 bodies=1
B. __enter__ fails           enters=1 exits=0 bodies=0
                             one enter, ZERO exits, ZERO bodies —
                             the block never existed
```

The counters prove the rule rather than restating it: enters and exits
are tallied separately, so a failed enter shows up as an enter with no
matching exit, and nothing inside the block ever ran.

## The design rule that follows

`__enter__` must clean up after **itself** if it fails partway, because
nothing else will. The third section acquires three parts and fails on
the third:

```
    acquired alpha
    acquired beta
    cannot acquire gamma - releasing what I already hold
    released alpha
    released beta
  failed to enter; parts still held afterwards: 0
```

Nothing leaked — but only because `__enter__` tidied up itself. Had it
simply raised after acquiring alpha and beta, those two would be held
forever, and no `__exit__` would ever come to free them.

Companion to [`examples/resource-guard-with/`](../resource-guard-with/),
which shows the three paths on which cleanup *does* run.

Verify it yourself:

```bash
pnpm eml transpile examples/manager-enter-failure/manager_enter_failure.eml
pnpm eml run examples/manager-enter-failure/manager_enter_failure.eml         # -> 1 enter / 0 exits on the failing path
pnpm eml trace examples/manager-enter-failure/manager_enter_failure.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/manager-enter-failure/manager_enter_failure.eml   # -> OK (fixpoint)
```
