# The pair reaches a state neither part lists — 3 of 3, 3 of 3, and an illegal pair

`the_pair_reaches_a_state_neither_part_lists.eml` drives two state machines
from one event stream, exhaustively over every sequence of length three, and
collects the combined states that actually occur.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the connection tracks idle / open / closing. The
transaction tracks none / active / committed. Both are complete, both reach
every state they declare, and no transition in either is wrong.

```
exhaustive sweep: every event sequence of length 3 over 6 events
  sequences run: 216

each component on its own
  connection states reached  : 3 of 3  ['open', 'closing', 'idle']
  transaction states reached : 3 of 3  ['none', 'active', 'committed']
  states either component reaches that it does not declare: 0
```

The pair is where the rule lives, and it is broken:

```
the pair
  combined states reached : 8 of 9
  ['open/none', 'open/active', 'closing/none', 'closing/active', 'open/committed', 'idle/none', 'idle/active', 'idle/committed']

  combined states that break the pair rule: 2
  ['closing/active', 'idle/active']
```

```
shortest event sequence reaching each illegal pair
  closing/active <- ['connect', 'begin', 'close']
  idle/active <- ['begin']
```

`idle/active` takes **one event**: a transaction becomes active before the
connection is ever opened.

The rule that fails — *a transaction must not be active while the connection is
not open* — is true and important, and it cannot be written inside either
component, because neither can see the other half of its own subject. Neither
component is wrong and neither list is incomplete. There is simply no file in
which both columns are in scope.

Verify it yourself:

```bash
pnpm eml run examples/the-pair-reaches-a-state-neither-part-lists/the_pair_reaches_a_state_neither_part_lists.eml
```
