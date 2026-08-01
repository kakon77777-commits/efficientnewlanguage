# Event router: branches that do nothing, on purpose

`event_router_ignored_branches.eml` routes four kinds of event and
**deliberately ignores two of them**.

**What it exercises**: ignoring an event is a decision, and it needs
somewhere to live. Without a no-op statement the choice is between two
bad options — leave the branch out, so the event falls through to a
catch-all and gets handled by accident; or put a dummy statement in it,
so no reader can tell "ignored on purpose" from "someone forgot to
finish this".

`pass` is the third option, and **until 2026-08-01 this language did not
have it**. `pass` parsed as an ordinary identifier: the Python emitter
printed the identifier and it happened to be exactly the right Python,
so the transpiled program ran correctly, while the interpreter — which
resolves names for real — raised `NameError: name 'pass' is not
defined`. Nine phases went by with the forward pipeline able to accept
it and unable to run it, because no corpus program had ever written the
word. The reverse Python→EML parser had refused `pass` outright since
Phase D, with a comment naming this exact risk; only one direction got
the guard.

The program's own check is an accounting one: every event lands in
exactly one bucket — routed, ignored, or rejected — and the buckets sum
to the input. The order total is recomputed independently, so a bug in
the running sum cannot hide behind itself.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 18 lines)

```
  order 23
  order 8
  order 41
  order total: 89

Ignored heartbeats: 2
Ignored debug:      2
Rejected (unknown kind):
  metrics
  shutdown

events in:  10
accounted:  10

Every event landed in exactly one bucket, and the totals agree.
An ignored branch that is empty and an ignored branch that is missing look
identical in the output and completely different in the source. That is the
whole argument for having a statement that does nothing.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`event_router_ignored_branches.trace.jsonl` beside this file is the recorded execution.
