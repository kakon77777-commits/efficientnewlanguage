# One customer set the roadmap

`one_customer_set_the_roadmap.eml` - One account is 4% of revenue and most of the roadmap.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Listening to them is not a mistake. They are the customer who writes detailed, specific, actionable requests instead of churning silently, and every item they asked for is a real gap - a team that ignored them would be ignoring the best-articulated feedback it receives.

What makes their requests visible is that they are written down. Everyone else's needs exist too; they arrive as silence, as a support ticket closed with a workaround, or as a renewal that does not happen.

Both shares are computed from the same account list, so "how much of the roadmap" and "how much of the business" are measured on one scale.

```
accounts : 9
  total revenue      : 1000
  requests filed     : 30
  requests shipped   : 11
```

```
the account that files the most
  a1
  share of revenue : 4%
  share of filed requests : 73%
  share of shipped work   : 81%
```

```
the accounts that filed nothing
  count   : 3 of 9
  revenue : 350  (35% of the business)
  shipped work attributable to them : 0
```

```
shipped items, actual against revenue-weighted
  a1 : shipped 9, revenue share would give 0
  a2 : shipped 0, revenue share would give 1
  a4 : shipped 1, revenue share would give 1
  a6 : shipped 0, revenue share would give 1
  a7 : shipped 1, revenue share would give 1
  a9 : shipped 0, revenue share would give 0
```

```
  a1 received 9 more items than its revenue share
```

```
their requests, by how many other accounts need the same thing
  custom SSO domain : 0 others
  bulk CSV import : 4 others
  audit log export : 1 others
  per-seat billing split : 0 others
  legacy API shim : 0 others
  needed by somebody else : 2
  needed by them alone    : 3
  most of what they ask for is theirs alone
```

```
control - a vocal account asking for what others also need
  requests : 3, needed by others : 3
  here following the loudest voice is following the population
```

Every request was real and every one was a genuine gap. Which gaps get written down is a property of who writes, and the roadmap is built from what is written.

Verify it yourself:

```bash
pnpm eml run examples/one-customer-set-the-roadmap/one_customer_set_the_roadmap.eml
```
