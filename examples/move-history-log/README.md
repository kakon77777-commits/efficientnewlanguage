# Tuples doing two jobs at once

`move_history_log.eml` — logs game moves as tuples inside a tuple.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a fixed-shape record and a growing sequence, both tuples, in one program.

Each move is a three-field record forever; the history is a sequence extended
by concatenation. The history being a tuple is deliberate — it can key a dict,
so a whole game position is memoisable, and that works only because tuple
hashing is recursive.

Verify it yourself:

```bash
pnpm eml run examples/move-history-log/move_history_log.eml
pnpm eml trace examples/move-history-log/move_history_log.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/move-history-log/move_history_log.eml   # -> OK (fixpoint)
```
