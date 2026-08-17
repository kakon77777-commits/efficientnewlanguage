# One counterexample retired a rule

`one_counterexample_retired_a_rule.eml` - A rule was removed after its visible failures. How often each policy is right is computed below; no figure is stated here, because a number in a comment is checked by nothing.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Removing it was not an overreaction in the moment. The failure was visible, expensive, and impossible to defend in the review - "the rule did this" is a complete answer to why it happened, and no equally short answer exists for the 47 times it quietly did the right thing.

That asymmetry is the whole case. A rule's successes are invisible by construction: they are the incidents that did not happen. Its failures each come with a ticket.

Both rules are run over the same 50 cases here, so the comparison is between two policies rather than between a policy and a memory.

```
cases : 50
```

```
the rule that was removed
  correct : 47 of 50
  wrong   : 3
```

```
what replaced it
  correct : 36 of 50
  wrong   : 14
```

```
  the replacement is right 11 times fewer
```

```
errors by direction
  old rule : approved 3 that should not have been, blocked 0 that should have been
  new rule : approved 0 that should not have been, blocked 14 that should have been
```

```
visibility of each error kind
  wrong approval : produces an incident with a ticket
  wrong block    : produces a delay, and nothing is filed
  old rule visible errors : 3
  new rule visible errors : 0
  old rule invisible errors : 0
  new rule invisible errors : 14
```

```
The replacement made the visible errors rarer and the invisible ones
commoner, and every number in the review was about the visible kind.
```

```
what was in the review
  the failure : 1 case, described in detail
  the rule's correct decisions : 47, none of them described
  a correct auto-approval leaves no artifact to describe
```

```
control - a rule that approves everything, i.e. no rule at all
  correct : 37 of 50
  the replacement : 36
  the removed rule : 47
  THE REPLACEMENT IS WORSE THAN HAVING NO RULE AT ALL, by 1
  and it is still preferred, because its errors are the invisible kind
```

The rule's failures each came with a ticket and its successes came with nothing. A count of tickets is a count of one of those two.

Verify it yourself:

```bash
pnpm eml run examples/one-counterexample-retired-a-rule/one_counterexample_retired_a_rule.eml
```
