# Duplicates are a property of the handler

`at_least_once_delivery.eml` replays a delivery log with known redeliveries through three handlers and compares each against the answer computed from the distinct messages alone.

**What it exercises**: "at least once" means the acknowledgement did not
arrive, not that the work failed. The queue's guarantee cannot be
strengthened, so the fix is always on the handler side, and there are
only two kinds.

Measured: the additive handler overcounts by **275**. A handler that
sets the resulting state rather than applying a delta is correct with no
bookkeeping at all. A seen-set is correct and needs storage proportional
to every distinct message ever processed — reported alongside the
correctness, because "correct" without the cost is half an answer.

The bounded seen-set is the part that turns correctness back into an
assumption: a window of 1 or 2 gets the wrong total, 3 and above get it
right, so the window size is a claim about how late a redelivery can
arrive rather than a property of the handler.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
bounded seen-set, by window size:
  window 1: total 650   correct False
  window 2: total 500   correct False
  window 3: total 375   correct True
  window 4: total 375   correct True
  window 8: total 375   correct True

checks passed: 5/5
Duplicates are free for a handler that sets, and cost storage for one that adds.

The queue's guarantee cannot be strengthened, so the fix is always on the
handler side, and there are only two kinds. Make the operation idempotent -
which usually means sending the resulting STATE rather than a delta - or
remember what you have seen, which is correct and unbounded. Bounding the
memory turns correctness back into an assumption about how late a
redelivery can be.
```
