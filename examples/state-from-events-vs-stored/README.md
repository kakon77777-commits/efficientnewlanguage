# State from events vs stored — replay is correct only for some orders

`state_from_events_vs_stored.eml` applies every ordering of one event set and
counts distinct final states, then does the same for a stored status column
written by whichever handler finished last.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "rebuild state by folding the events" is described as
deriving the truth rather than storing it — and that is true only if the fold
does not depend on the order, which is to say only if the operations commute.

```
orderings of the same three events: 6
distinct final states: 4
commuting pairs: 2/3
```

Most state transitions do not commute: `pay` then `refund` is not `refund`
then `pay`. So the derivation carries a hidden precondition **about the log**,
and the log is a different system with its own ordering guarantees.

The stored column is measured alongside and loses more: fewer distinct values
than there are distinct states, and it matches the fold on only **5 of 6**
orderings.

The control is the ordering everybody tests. On `pay, ship, refund` — the order
events are supposed to arrive in — both models agree exactly. That is the
fixture.

The two models depend on two *different* orders: events are ordered by the log,
handlers by the scheduler. When those agree the models agree, which is most of
the time, which is why the difference is found during an incident.

Verify it yourself:

```bash
pnpm eml run examples/state-from-events-vs-stored/state_from_events_vs_stored.eml
```
