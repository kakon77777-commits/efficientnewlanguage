# What can be a key

`hashable_key_rules.eml` — shows which values can key a dict or join a set, and what the failure says.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: numeric key unification, recursive tuple hashability, and use-site error wording.

A value is hashable when it is immutable all the way down. `1`, `1.0` and
`True` are the SAME key. A tuple qualifies exactly when every element does.

The message names two types, not one — *cannot use 'tuple' as a dict key
(unhashable type: 'list')* — the value you wrote and the part that made it
impossible, with "set element" substituted at a set. This interpreter used to
report only the inner half, pointing at a type the programmer never wrote.

Verify it yourself:

```bash
pnpm eml run examples/hashable-key-rules/hashable_key_rules.eml
pnpm eml trace examples/hashable-key-rules/hashable_key_rules.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/hashable-key-rules/hashable_key_rules.eml   # -> OK (fixpoint)
```
