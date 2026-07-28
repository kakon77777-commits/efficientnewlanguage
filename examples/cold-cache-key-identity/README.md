# What counts as "the same arguments"

`cold_cache_key_identity.eml` measures which argument values share a
`@cold` cache entry. The obvious guess — Python equality, so
`1 == 1.0 == True` is one entry — is wrong, and wrong in a way that
depends on **how many arguments the function takes**.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

| arity | grouping |
|---|---|
| one argument | `1` is its own entry; `1.0` and `True` **share** a second |
| two arguments | all three are **one** entry |

Same function, same three values, opposite groupings.

**Why**: `@cold` compiles to `functools.cache`, whose key builder has a
fast path — a single argument whose type is *exactly* `int` or `str`
becomes the key itself rather than a tuple. So `1` is keyed by the bare
int, while `1.0` (a float) and `True` (type `bool`, not `int`) both fall
through to tuple keys, and those tuple keys compare equal to each other.
With two arguments the fast path never applies, all three build tuple
keys, and `(1, 0) == (1.0, 0) == (True, 0)`.

The returned values record it too — a cache hit returns what was
*stored*, so `one_arg(True)` prints `1.0` and the two-argument block
returns `1` for all three.

## What this case found

It failed the first time it ran the execution-truth gate, and the failure
was real. EML's interpreter keyed its cold cache on a **repr** of the
arguments, so `True` ("True") and `1.0` ("1.0") landed in different
entries while CPython put them in the same one. The in-browser run
printed `True` where real Python printed `1.0`.

The cache is now keyed the way Python keys a dict (`canonicalKey`), fast
path included — see `packages/interp/src/index.ts`.

Two things about how it surfaced are worth recording:

- **`pnpm eml run` could not have caught it.** That command transpiles
  and runs *real CPython*; it is not the interpreter. Comparing it
  against `pnpm eml transpile | python` compares Python with Python.
  `tests/interp.test.ts` is the actual gate.
- **`eml trace --run` did not catch it either** — it reported
  `eml:equiv ok:true`. Only exact stdout comparison did.

**The practical reading**: do not rely on `@cold` treating
numerically-equal arguments of different types as the same call.
Normalise types at the boundary if it matters.

Verify it yourself:

```bash
pnpm eml transpile examples/cold-cache-key-identity/cold_cache_key_identity.eml
pnpm eml run examples/cold-cache-key-identity/cold_cache_key_identity.eml         # -> two computations, then one
pnpm eml roundtrip examples/cold-cache-key-identity/cold_cache_key_identity.eml   # -> OK (fixpoint)
```
