# @cold, made visible

`cold_memoization_visible.eml` is the corpus's **first use of EML's
temperature model**. The 124 programs before it used neither `@cold` nor
`@hot`, despite those being among EML's most distinctive features.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: that `@cold` is not a hint.

`@cold` transpiles to `@functools.cache`, and EML's interpreter emulates
that same cache, so the annotation changes **how many times the body
runs**. Deleting one line changes the program's output.

Six requests over three distinct values produce exactly three
computations:

```
    [computing collatz_length(27)]
  request 27 -> 111
    [computing collatz_length(6)]
  request 6 -> 8
  request 27 -> 111
    [computing collatz_length(9)]
  request 9 -> 19
  request 6 -> 8
  request 27 -> 111

Served 6 requests from 3 computations.
```

## About the print inside the cached function

Making a cache visible needs an observation instrument, and the only
honest one is a side effect. That is deliberately the thing EML warns
about:

```
[warning] W_COLD_SIDE_EFFECT: @cold function 'collatz_length' has side
effects; it is not safely cacheable as pure logic.
```

**The warning is correct.** This case demonstrates *why it exists* rather
than arguing against it. A cached function's side effects happen once per
distinct argument instead of once per call — which is exactly what makes
them unsafe in real code, and exactly what makes them usable here as a
counter. The print is the measuring device, not the lesson.

For the case where `@cold` changes the *answer* rather than the count,
see [`examples/cold-stale-state/`](../cold-stale-state/).

Verify it yourself:

```bash
pnpm eml transpile examples/cold-memoization-visible/cold_memoization_visible.eml
pnpm eml run examples/cold-memoization-visible/cold_memoization_visible.eml         # -> 6 requests, 3 computations
pnpm eml trace examples/cold-memoization-visible/cold_memoization_visible.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/cold-memoization-visible/cold_memoization_visible.eml   # -> OK (fixpoint)
```
