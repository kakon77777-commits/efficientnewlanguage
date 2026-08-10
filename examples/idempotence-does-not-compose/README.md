# Idempotence does not compose — three retry-safe routines, two retry-unsafe pairs

`idempotence_does_not_compose.eml` measures `f(f(x)) == f(x)` for three cleanup
routines, then measures the same property for every ordered pair built from
them.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `idempotence-witness` in this corpus checks the property
for individual routines, because that is what every retry depends on. This file
asks the next question. Each routine has the property:

```
each routine applied twice, over every input
  collapse: inputs where f(f(x)) != f(x) = 0
  dropzero: inputs where f(f(x)) != f(x) = 0
  cap: inputs where f(f(x)) != f(x) = 0
```

The pairs do not all keep it:

```
ordered pairs, applied twice, over every input
  first collapse then dropzero: NOT idempotent on 2 of 9
  first collapse then cap: NOT idempotent on 2 of 9
  first dropzero then collapse: idempotent
  first dropzero then cap: idempotent
  first cap then collapse: idempotent
  first cap then dropzero: idempotent

pairs built from idempotent parts that lost the property: 2
```

```
witness for first collapse then dropzero
  x        = [1, 0, 1]
  h(x)     = [1, 1]
  h(h(x))  = [1]
```

Removing the zero from `[1, 0, 1]` puts two `1`s next to each other. Collapse
already ran and will not run again — until the whole pipeline is replayed, and
then it does.

**Why this matters more than the property on one function.** Production does
not retry a step, it retries a pipeline. A queue redelivers the message; a job
runner reruns the task; whatever ran before runs again from the top. The thing
being replayed is the composition, and nobody tested the composition for the
property, because each part was tested and each part passed.

**The mechanism, measured rather than asserted.** Ask whether the second
routine hands back something the first one still has work to do on:

```
is the second routine's output already a fixed point of the first?
  first collapse then dropzero: outputs that collapse would still change = 2
  first collapse then cap: outputs that collapse would still change = 2
  first dropzero then collapse: outputs that dropzero would still change = 0
  first dropzero then cap: outputs that dropzero would still change = 0
  first cap then collapse: outputs that cap would still change = 0
  first cap then dropzero: outputs that cap would still change = 0

pairs where 'first routine has work left' and 'pair is not idempotent'
agree: 6 of 6
```

That agreement is measured on this input set, not proved. It is the mechanism
worth carrying: a pair keeps the property only while the second routine never
hands back something the first one still has work to do on.

Verify it yourself:

```bash
pnpm eml run examples/idempotence-does-not-compose/idempotence_does_not_compose.eml
```
