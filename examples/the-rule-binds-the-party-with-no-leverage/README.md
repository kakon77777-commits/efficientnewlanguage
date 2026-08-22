# The rule binds the party with no leverage

`the_rule_binds_the_party_with_no_leverage.eml` - The integration standard applies to every partner. Which partners it has actually been applied to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Having one standard is right. It is written once, it is the same document for everybody, and a platform that negotiates its interface separately with each partner ends up with as many interfaces as partners. Nothing in the document distinguishes between them.

Applying it needs the platform to be willing to refuse the integration. That willingness is not constant across partners: a partner who is 40% of revenue is refused differently from one who is 0.3%, and the standard has no term for revenue.

Compliance is counted against leverage.

```
partners : 8
violations of the standard : 26
exemptions granted         : 13
integrations blocked       : 4
```

```
partner   revenue share   violations   exempted   blocked
  alpha     40.0%           6            6          no 
  beta     22.0%           4            4          no 
  gamma     9.0%           3            1          no 
  delta     3.0%           3            0          yes
  epsilon     1.2%           2            0          yes
  zeta     0.8%           5            0          yes
  eta     18.0%           2            2          no 
  theta     0.5%           1            0          yes
```

```
partners at 10% of revenue or more
  violations : 12, exempted : 12
  exemption rate : 100%
partners under 10%
  violations : 14, exempted : 1
  exemption rate : 7%
```

```
integrations blocked, by partner size
  delta : 3.0% of revenue, 3 violations
  epsilon : 1.2% of revenue, 2 violations
  zeta : 0.8% of revenue, 5 violations
  theta : 0.5% of revenue, 1 violations
  combined revenue share of every blocked partner : 5.5%
```

```
the partner with the most violations : alpha, 6
  revenue share : 40.0%
  blocked : no, exempted 6 times
```

```
what the document contains
  requirements     : the same for every partner
  exemption clause : discretionary, no criteria written
  revenue          : not mentioned
  the discretion is the only place a difference can enter, and it is the
  only part with no criteria
```

```
if the exemption clause named its criteria
  exemptions that would survive a stated rule : whatever the rule says
  exemptions that would have to be argued     : 13
  what changes is not the outcome but whether the reason is on the record
  where the next partner can point at it
```

```
control - a requirement the handshake rejects
  partners that can violate it : 0, the connection fails
  exemptions possible          : 0, there is nobody to ask
  the same standard, moved from a document into the protocol, and the
  difference is that refusing is no longer a decision somebody makes
```

One standard for every partner is the right design and the document does not mention revenue. Applying it means being willing to refuse, and that willingness is the part that varies.

Verify it yourself:

```bash
pnpm eml run examples/the-rule-binds-the-party-with-no-leverage/the_rule_binds_the_party_with_no_leverage.eml
```
