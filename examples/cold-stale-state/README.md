# When @cold changes the answer

`cold_stale_state.eml` is the other half of
[`examples/cold-vs-hot-fibonacci/`](../cold-vs-hot-fibonacci/). That case
makes the reassuring point — for a genuinely pure function, `@cold` and
`@hot` agree on every value and differ only in cost. This one makes the
point that actually bites.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `@cold` on a function that is not pure.

`price` takes `units` as its only argument but reads a module-level
`rate`. The rate is not part of the cache key, so when it changes the
cached answer becomes silently wrong. Not slow — **wrong**:

```
rate = 5
  price_cold(10) = 50   price_hot(10) = 50
  (both correct - the cache is being filled here)

rate = 10   <- the rate doubled
  price_cold(10) = 50   price_hot(10) = 100

  They DISAGREE. @cold returned the rate-5 answer at rate 10.
```

Nothing at the call site changed. Nothing raises. The only difference
between the two functions is one annotation, six lines apart.

**The staleness is per-key, which makes it harder to spot, not easier.**
An argument the cache has not seen is still computed fresh:

```
  price_cold(20) = 200   price_hot(20) = 200   (agree - 20 was never cached)
```

So the same function is correct for arguments it has not seen and wrong
for the ones it has. A test that only exercises new inputs passes.

This is what the temperature model is *for*. "Does this depend on
anything outside its arguments?" is a question the author has to answer,
and `@cold` is the promise that it does not. The compiler cannot check
that promise in general — it only warns about the obvious cases — so the
annotation carries real weight, and picking it carelessly is a bug rather
than a style choice.

Verify it yourself:

```bash
pnpm eml transpile examples/cold-stale-state/cold_stale_state.eml
pnpm eml run examples/cold-stale-state/cold_stale_state.eml         # -> the two diverge after the rate changes
pnpm eml trace examples/cold-stale-state/cold_stale_state.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/cold-stale-state/cold_stale_state.eml   # -> OK (fixpoint)
```
