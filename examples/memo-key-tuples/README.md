# Why a tuple key, not a joined string

`memo_key_tuples.eml` — memoises a two-argument function by hand.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuple keys for a cache, and the collision the string alternative causes.

The program demonstrates the collision rather than asserting it: tuple keys
`(1, 2)` and `("1", 2)` stay distinct because tuple equality compares
elements, while the joined-string keys collapse to one entry and the first
value is silently lost.

Verify it yourself:

```bash
pnpm eml run examples/memo-key-tuples/memo_key_tuples.eml
pnpm eml trace examples/memo-key-tuples/memo_key_tuples.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/memo-key-tuples/memo_key_tuples.eml   # -> OK (fixpoint)
```
