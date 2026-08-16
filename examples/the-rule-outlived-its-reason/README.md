# The rule outlived its reason - 6 rejections and 0 downstream failures, in both eras

`the_rule_outlived_its_reason.eml` runs the same rule against both eras so that "what did it catch" is answered per era rather than in aggregate.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the rule is not superstition. When it was written there was a real constraint and every rejection prevented a break. The constraint went away when that system was replaced; the rule did not, because a rule with no failures attached to it is a rule nobody is asked about.

```
batches : 12, rule : reject anything over 4
```

```
in the era the rule was written for
  rejected            : 6
  would have broken   : 6
  would have been fine: 0
```

```
in the era after the downstream was replaced
  rejected            : 6
  would have broken   : 0
  would have been fine: 6
```

```
the rule's own report, in both eras
  era 1 : 6 rejections, 0 downstream failures
  era 2 : 6 rejections, 0 downstream failures
  identical, and only one of them is evidence that the rule is doing anything
```

```
the cost in the current era
  items in rejected batches : 50 of 68
  failures prevented        : 0
  work refused per failure prevented : none - the denominator is zero
```

```
what would separate the two eras
  the rule's rejection count : identical
  the downstream failure count : identical (both zero)
  what a batch over the limit actually does : the only thing that differs
  letting one batch of 5 through would answer it in one attempt
```

```
control - a system where the constraint still holds
  rejected : 2
  would have broken : 2
  every rejection is load-bearing, and the report looks the same as above
```

A rule with a clean record is either working or unnecessary, and the record reads the same either way. The reason it was written is the thing that would tell you, and reasons are not enforced.

Its record stays clean for the same reason it is now useless: it is still rejecting, and nothing downstream is complaining. The only observation that separates the two eras is what a rejected batch would actually do - which requires letting one through.

Verify it yourself:

```bash
pnpm eml run examples/the-rule-outlived-its-reason/the_rule_outlived_its_reason.eml
```
