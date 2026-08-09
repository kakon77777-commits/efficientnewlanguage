# Cancelled work still holds its slot — the pool ran out on a request that was fine

`cancelled_work_still_holds_its_slot.eml` replays a twelve-request stream
through a three-slot pool under two release placements, and reports the pool
over time plus which request first gets refused.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a request takes a slot and gives it back on the way out.
"On the way out" is a specific line, and it sits on the success path — the path
that was written first and the only one that existed for a while. Cancelling
returns early. Early is before that line.

| release placed | slots still held | served | refused | first refusal at | that request was |
| --- | --- | --- | --- | --- | --- |
| success-path | **3** | 4 | **5** | index 7 | **ok** |
| finally | 0 | 8 | 0 | never | — |

Request by request:

```
  1   cancel   slots held after: 1    held (never released)
  4   cancel   slots held after: 2    held (never released)
  6   cancel   slots held after: 3    held (never released)
  7   ok       slots held after: 3    REFUSED
  8   ok       slots held after: 3    REFUSED
```

```
cancellations before the first refusal: 3, pool size: 3
```

One slot per cancellation, and the pool survives exactly as many cancellations
as it has slots — measured rather than assumed.

**Nothing fails at the leak.** The cancelled requests were meant to end. The
failure surfaces on request 7, which is healthy, was never cancelled, and has
nothing to do with the cause — and that is where the investigation starts.

Releasing on the way out means releasing on *one* way out. Cancellation is a
second exit, added later, and it leaves through a door the resource accounting
does not watch.

Verify it yourself:

```bash
pnpm eml run examples/cancelled-work-still-holds-its-slot/cancelled_work_still_holds_its_slot.eml
```
