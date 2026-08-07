# New enum value fallthrough — the else branch answers for a case it never saw

`new_enum_value_fallthrough.eml` asks four consumers the same question about
every value in an old enum and then about a value added afterwards, and
classifies each answer as right, silently wrong, or a loud failure.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: adding a value to an enum is a compatible change to the
producer and a semantic change to every consumer.

| consumer | old values right | on the new value | classification |
| --- | --- | --- | --- |
| if/else | 4/4 | `no` | silently wrong |
| lookup + default | 4/4 | `no` | silently wrong |
| lookup + raise | 4/4 | `ERROR` | loud failure |
| lookup + quarantine | 4/4 | `HOLD` | held for review |

All four are correct on every **old** value, so no test written before the
change can distinguish them.

The two that report nothing are the two that read as complete: an `else` branch
looks like a total function and a default value looks like a deliberate
fallback. Refusing looks like a gap; answering looks like coverage.

**The sharpest measurement is the luck check.** With the added value
`chargeback` — which is *not* revenue — the two guessing consumers happen to be
right. Rerun with a value that **is** revenue and they are both wrong. So they
were not careful, they were fortunate, and whether the luck holds is a property
of the *next* value somebody adds.

Verify it yourself:

```bash
pnpm eml run examples/new-enum-value-fallthrough/new_enum_value_fallthrough.eml
```
