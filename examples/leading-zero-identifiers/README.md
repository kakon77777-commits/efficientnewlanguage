# Leading-zero identifiers — two customers, one key

`leading_zero_identifiers.eml` runs real-shaped identifiers through an integer
round trip and counts three separate failures: identifiers that do not come
back as themselves, distinct identifiers that **collide**, and identifiers that
lose digits to float precision.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: account numbers, ZIP codes, part numbers and order
references are written with digits and are not quantities. Nothing is ever
added to them.

Three distinct pairs merge into one key:

```
  007 and 7 both become 7
  0123 and 123 both become 123
  00000 and 0 both become 0
```

The float path loses a digit the integer path keeps —
`9007199254740993 → 9007199254740992` — which is what a JSON parser without a
big-integer path does to a 16-digit reference.

None of it raises. The insert succeeds, the lookup succeeds, and the customer
whose account begins with a zero is served someone else's data.

The check that closes the escape route: **all 10 identifiers pass a
digits-only validator**, so no schema rule phrased as "must be numeric" rejects
any of them. And storing them as strings is lossless for every one — the fix
has to actually work, or the case is only complaining.

Verify it yourself:

```bash
pnpm eml run examples/leading-zero-identifiers/leading_zero_identifiers.eml
```

```bash
pnpm eml trace examples/leading-zero-identifiers/leading_zero_identifiers.eml --run
```
