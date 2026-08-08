# Deny loses to allow — the role that cannot take anything away

`deny_loses_to_allow.eml` computes each user's effective permissions two ways —
as a **union of grants** and with **deny winning** — and then sweeps the
structural question directly: can attaching a role ever remove a permission?

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a permission model assembled by collecting what roles
grant. `suspended` and `legal_hold` are written correctly, attached correctly,
and enforced by an operator that has nowhere to put them.

| | union | deny-wins |
| --- | --- | --- |
| (user, action) pairs where they disagree | 5 of 20 | |
| union allows an action an attached role explicitly denies | **5** | — |
| permissions removed by attaching a role (30 attachments) | **0** | 3 |
| what `suspended` removes | **0** | 2 |
| what `legal_hold` removes | **0** | 1 |

The monotonicity row is the defect stated as a measurement rather than as a
claim. Under a union, attaching a role removed nothing across all thirty
attachments — not because these particular roles are weak, but because a union
has no operator that subtracts. A role named `suspended` is inert for the same
reason a role named anything else would be.

The disagreements all point one direction: there are **0** pairs where
deny-wins is the more permissive model. So the union is not a different policy,
it is a strictly weaker one, and the difference is exactly the set of rules
somebody wrote to restrict access.

Verify it yourself:

```bash
pnpm eml run examples/deny-loses-to-allow/deny_loses_to_allow.eml
```
