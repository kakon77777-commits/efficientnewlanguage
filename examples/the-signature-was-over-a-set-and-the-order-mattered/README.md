# The signature was over a set and the order mattered

`the_signature_was_over_a_set_and_the_order_mattered.eml` - The change detector reported the routing ruleset unchanged across a deploy, and its signature was computed correctly. What the signature is over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The signature scheme is sound. It hashes the actual rules, not a label; the hash is strong; it is recomputed on every deploy; and a differing signature blocks the deploy for review. An identical signature means the rules are the same rules.

The signature is over the SET of rules, and the rules are evaluated first-match-wins, so their order decides the outcome.

```
rules                           : 12
distinct rulesets by signature  : 1
distinct orderings deployed     : 2
  the signature told apart      : 1
  it could not tell apart       : 1
requests routed differently     : 8100
deploys flagged for review      : 0
rerouted share (of 90000)       : 900 per ten thousand
```

```
the change detector
  hashes : the actual rules, not a label
  hash strength : strong
  recomputed : every deploy
  on a differing signature : blocks for review
  signatures that differed : 1
  verdict : RULESET UNCHANGED
```

```
  hashing the rules themselves rather than a version label
  is the part done right here, and it is why a real edit
  to a rule would be caught
```

```
the bytes the signature covers
  what is hashed : the set of rules, canonicalized by
    sorting
  why sorted : so a reordering in the file is not a false
    change
  how the rules are evaluated : first-match-wins, in
    order
  so order : is meaning, not formatting
  what sorting the set discards : exactly that meaning
```

```
the same twelve rules, two orders
  signature of each : identical
  what the detector said : no change
  requests the two orders route differently : 
    8100
  is the signature wrong : no; the set of rules is the
    same set
  is the set the thing that decides routing : no; the
    order is
```

```
null control - hash the ordered list, not the set
  signatures, hashing the set : 
    1
  signatures, hashing the order : 
    2
  deploys it would flag : 1
  no rule changed; the signature stopped discarding the
  order that decides the outcome
```

```
what an unchanged signature guarantees
  the set of rules is identical : exactly, strong hash,
    recomputed every deploy
  the routing is unchanged : not addressed; the signature
    is over the set of rules and evaluation is
    first-match-wins - reordering the same 12 rules kept the
    signature identical and routed 8100 requests differently
```

```
a signature proves identity of what it hashes, and hashing a set proves
identity of the set; when order carries meaning, canonicalizing it away makes
the signature blind to the very change it is watching for
```

It hashes the real rules with a strong hash every deploy and blocks on a diff - a correct signature over the set. Evaluation is first-match-wins, so the same 12 rules in two orders share one signature and route 8100 requests apart, under 0 deploys flagged.

Verify it yourself:

```bash
pnpm eml run examples/the-signature-was-over-a-set-and-the-order-mattered/the_signature_was_over_a_set_and_the_order_mattered.eml
```
