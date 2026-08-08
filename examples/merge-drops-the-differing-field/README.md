# Merge drops the differing field — a gap and a contradiction are the same shape in the code

`merge_drops_the_differing_field.eml` merges four record pairs field by field
with "first non-empty wins", then re-runs every merge with the two sources
swapped and counts how many merged fields change.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the obvious merge rule, which is right about the case
everybody has in mind — one source knows the phone number and the other does
not — and silent about the case that carries all the news.

| | count |
| --- | --- |
| cells compared | 20 |
| both sources agree | 12 |
| one source blank (**gap**) | 3 |
| both present and different (**disagreement**) | **5** |

Swapping the argument order:

| | count |
| --- | --- |
| merged cells whose value changes when the sources are swapped | **5** |
| of those, cells that were gaps | **0** |

**Order-dependent cells = disagreements, exactly.** Filling a gap is genuinely
commutative, which is why the rule looks safe when it is tested on gaps. Every
contradiction, and only a contradiction, was settled by argument position.

The same policy with the decisions surfaced raises **5** fields for review and
differs from the silent merge in **0** cells outside them — so it is not a
different policy, it is the same one with the choices made visible.

The disagreements are spread over four fields (`email` 1, `phone` 1, `address`
1, `status` 2). They land there because a disagreement requires that something
*changed*: the address after a move, the phone after a switch, the status after
a suspension. The rule discards precisely the recent facts.

Verify it yourself:

```bash
pnpm eml run examples/merge-drops-the-differing-field/merge_drops_the_differing_field.eml
```
