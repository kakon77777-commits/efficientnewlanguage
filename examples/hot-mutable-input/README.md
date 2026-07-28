# Why @hot exists

`hot_mutable_input.eml` argues that `@hot` is a **correctness**
annotation that happens to disable an optimisation — not an optimisation
annotation that happens to be a no-op.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two independent reasons a function needs `@hot`.

### Reason 1 — the argument cannot be a cache key at all

`@cold` becomes `@functools.cache`, which stores arguments in a dict, so
every argument must be hashable. A list is not. This is not a style
objection; it is a `TypeError` at the first call, and the case **proves
it by running it** rather than asserting it:

```eml
try:
    average_cold(readings) => v
    ...  <- unreachable
except TypeError:
    "  average_cold(readings) raised TypeError - a list is unhashable,"
```

### Reason 2 — the answer is supposed to change

The deeper reason. Even if lists *were* hashable, caching would be wrong
here: the whole point is that the same list gives different answers as
its contents change. The case mutates the readings between calls:

```
  average_hot([10, 20, 30]) = 20.0
  after readings[0] = 40  -> 30.0
  after readings[1] = 50  -> 40.0
  after readings[2] = 60  -> 50.0

Four calls, 3 of the 3 consecutive pairs differ.
A cache would have returned 20.0 every time.
```

Same list object, same call site, four different correct answers. A
cache keyed on "the same argument" would freeze the first one forever.

Verify it yourself:

```bash
pnpm eml transpile examples/hot-mutable-input/hot_mutable_input.eml
pnpm eml run examples/hot-mutable-input/hot_mutable_input.eml         # -> the TypeError, then 4 changing answers
pnpm eml trace examples/hot-mutable-input/hot_mutable_input.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/hot-mutable-input/hot_mutable_input.eml   # -> OK (fixpoint)
```
