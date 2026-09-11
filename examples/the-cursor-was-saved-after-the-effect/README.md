# The cursor was saved after the effect

`the_cursor_was_saved_after_the_effect.eml` - The poller has processed every record in order without skipping one, and the ordering is correct. What the saved cursor and the effect straddle is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The poller is careful. It reads a batch in order; it never advances the cursor past a record it has not handled; it resumes from the saved cursor on restart; and it never skips, so no record is lost.

The cursor is saved after the batch's effects, and the two are not atomic.

```
records processed               : 800000
  skipped                       : 0
batch size                      : 500
crashes between effect and save : 12
records replayed                : 6000
```

```
effects applied                 : 806000
  duplicate effects             : 6000
duplicate effect rate           : 75 per ten thousand
```

```
the poller
  reads : a batch, in order
  the cursor : never advances past an unhandled record
  on restart : resumes from the saved cursor
  skips : none, so no record is lost
  records missed : 0
  verdict : NONE LOST, IN ORDER
```

```
  never advancing past an unhandled record is the part
  done right here, and it is why nothing is skipped
```

```
the order of the two writes
  first : the batch's effects are applied
  then : the cursor is saved past the batch
  between them : a window with no atomicity
  a crash in that window : loses the cursor save, keeps
    the effects
  on resume : the batch is read again and its effects
    reapplied
  records replayed per crash : 500, the whole batch
```

```
the downstream of the effect
  records the poller believes it processed : 
    800000
  effects that actually landed : 806000
  duplicates : 6000
  was a record skipped : no; not-lost is the property
    the poller guarantees
  was a record applied twice : yes, a batch per crash,
    75 per ten thousand
```

```
null control - effect and cursor in one transaction
  crashes : 12, unchanged
  duplicate effects : 0
  records skipped : 0
  no crash and no ordering changed; the effect and the
  cursor stopped being two writes with a gap between them
```

```
what a never-skipping poller guarantees
  no record is lost : exactly, the cursor never passes an
    unhandled record and resume reads from it
  each record is processed once : not addressed; the
    cursor is advanced after the effect and not atomically
    with it, so a crash in the gap replays the batch - 
    12 crashes reapplied 6000 effects
```

```
at-least-once and at-most-once are two guarantees, and a cursor saved after the
effect buys the first by giving up the second; exactly-once needs the effect
and the checkpoint to be the same commit, not two in an order
```

The poller never skips: the cursor trails the handled record and resume reads from it - nothing is lost. The cursor saves after the effects, not atomically, so 12 crashes replayed a batch each, 6000 duplicate effects, 75 per ten thousand, against 0 skipped.

Verify it yourself:

```bash
pnpm eml run examples/the-cursor-was-saved-after-the-effect/the_cursor_was_saved_after_the_effect.eml
```
