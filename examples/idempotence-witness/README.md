# Safe once, not safe twice

`idempotence_witness.eml` applies four cleanup routines up to five times each and checks the property that every retry depends on: `f(f(x)) == f(x)`.

**What it exercises**: almost every "normalize", "sanitize" and "escape"
routine is written as if idempotence were automatic. Two of the four
here are not, and they fail in opposite directions — stripping one
prefix per call *loses* data on the retry, escaping on every call *adds*
it, so `&` becomes `&amp;amp;` and a harmless redelivery corrupts the
payload.

Nothing in the value records whether it has already been through the
operation. That is the whole difficulty: the routine cannot tell a
string it already trimmed from one that arrived that way. Idempotence is
bought by making the output recognisable to the function — a guard that
skips an already-escaped `&`, or removing *every* prefix rather than one.

Swept over every string of length 0–3 over an alphabet chosen to give
both routines something to chew on.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  '&-' -> '&amp;-' -> '&amp;amp;-'

original:                tom & jerry
escaped once:            tom &amp; jerry
retried through once:    tom &amp;amp; jerry
retried through guarded: tom &amp; jerry

checks passed: 5/5
Two routines settle on the first application; two never do.

Nothing in the value records whether it has been through the operation.
That is the whole difficulty: `strip_prefix` cannot tell a string it has
already trimmed from one that arrived that way, and `escape_once` cannot
tell an escaped ampersand from a literal one. Idempotence is bought by
making the OUTPUT recognisable to the function - which is what the guard
does, and what removing every prefix rather than one does.
```
