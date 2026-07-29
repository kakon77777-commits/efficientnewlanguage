# What a set is for, and what it costs

`set_membership_dedup.eml` covers set literals — used incidentally by the
corpus, never examined — and the one thing they are unambiguously for:
asking *have I seen this before* without scanning.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**The honest shape** is a set for the check **and** a list for the order.
A set alone loses the sequence; a list alone makes every check a scan.
The result is cross-checked against a quadratic scan-based dedup that
uses no set at all — both produce `['ana', 'raj', 'kim', 'lee']`.

**Order and repetition do not exist inside a set:**

```
  {1, 2, 2, 3} has 3 elements
  {3, 2, 1}    has 3 elements
  equal as sets: True
```

**Numeric keys collapse, exactly as dict keys do:**

```
  {1, 1.0, True} -> 1 element
  {0, False}     -> 1 element
  1.0 in {1, 2}   -> True
  True in {1, 2}  -> True
```

That surprises people, and it has a practical edge: a set of "IDs" that
mixes ints and booleans silently merges them.

**What a set costs you is the order** — which is precisely why the
first-seen list in the first section is a list.

Verify it yourself:

```bash
pnpm eml transpile examples/set-membership-dedup/set_membership_dedup.eml
pnpm eml run examples/set-membership-dedup/set_membership_dedup.eml         # -> dedup agrees with the scan, keys collapse
pnpm eml trace examples/set-membership-dedup/set_membership_dedup.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/set-membership-dedup/set_membership_dedup.eml   # -> OK (fixpoint)
```
