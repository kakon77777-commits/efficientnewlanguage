# Cancel is not idempotent — both designs cancel correctly once

`cancel_is_not_idempotent.eml` applies cancel one, two and three times to the
same booking under two designs — cancel-as-delta and cancel-as-target-state —
and reads the resulting seats and refunds back out.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: cancel *undoes* something — releases a seat, issues a
refund, returns a licence. Undoing is a delta, and a delta composes.

| design | cancels | status | seats held | refunds issued |
| --- | --- | --- | --- | --- |
| delta | 1 | cancelled | 0 | 1 |
| delta | 2 | cancelled | **-1** | **2** |
| delta | 3 | cancelled | **-2** | **3** |
| state | 1 | cancelled | 0 | 1 |
| state | 2 | cancelled | 0 | 1 |
| state | 3 | cancelled | 0 | 1 |

One cancel behaves identically under both. The difference only appears on
repetition, which is why it survives review — and cancel is called twice for
entirely ordinary reasons: the user clicks again when the response is slow, a
client retries a request whose response was lost, a cleanup job cancels
something a human already cancelled.

The column that hides it:

```
rows whose status is not 'cancelled': 0
```

**Every row says `cancelled`.** A check that asks "is it cancelled?" passes for
all six, including the one holding **-2** seats and having issued three refunds
for one booking.

The fix is not to make cancel careful. It is to state the policy as a target
state — *this booking is cancelled* — so that applying it to an already
cancelled booking is a no-op by construction, rather than by a guard somebody
has to remember to write.

Verify it yourself:

```bash
pnpm eml run examples/cancel-is-not-idempotent/cancel_is_not_idempotent.eml
```
