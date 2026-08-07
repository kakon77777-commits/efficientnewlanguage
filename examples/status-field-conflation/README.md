# Status field conflation — the states that cannot be written down

`status_field_conflation.eml` enumerates an order's real state space as the
product of two independent dimensions and marks which points a single status
enum can name.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a column being asked to hold a **pair** in one slot.

```
real states: 3 payment x 3 fulfilment = 9
enum values available: 5
real states the enum can name: 4/9
real states with no value at all: 5
enum values with no real state behind them: 1
```

Two failures pointing in opposite directions, both from one column. Five real
situations have no value to write; one enum value (`cancelled`) corresponds to
no point in the space at all, because it is a **third** dimension folded in for
feeling like a status.

A plausible order history — placed, paid, dispatched, refunded, returned —
contains **2 of 5** steps the column cannot represent. The interesting one is
`refunded` after `shipped`: an ordinary event with nothing to store.

The control: the four states the enum **can** hold survive a write-then-read
perfectly. The loss is entirely at the states it cannot hold, which is also
where no error is raised.

The giveaway is not a missing transition. It is that `shipped` and `refunded`
are not two points on one line — they answer different questions, and an order
can be both.

Verify it yourself:

```bash
pnpm eml run examples/status-field-conflation/status_field_conflation.eml
```
