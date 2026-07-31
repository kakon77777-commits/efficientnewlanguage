# A set you can ask about but never store

`frozen_membership_quirk.eml` — isolates one genuine CPython quirk.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: set membership where the probe is itself a set.

`{{1, 2}}` raises — a set is unhashable and cannot be an element. But
`{1, 2} in {1, 2}` answers **False** rather than raising, because CPython's
`set.__contains__` catches the TypeError and retries the lookup as a frozenset.

Nothing else gets that rescue: `[1] in a_set` still raises. Found by sweeping
every (operator, left type, right type) cell against real CPython — the kind of
behaviour that only appears when you actually run the combination.

Verify it yourself:

```bash
pnpm eml run examples/frozen-membership-quirk/frozen_membership_quirk.eml
pnpm eml trace examples/frozen-membership-quirk/frozen_membership_quirk.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/frozen-membership-quirk/frozen_membership_quirk.eml   # -> OK (fixpoint)
```
