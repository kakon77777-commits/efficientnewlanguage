# The schema still enforces a rule that ended

`the_schema_still_enforces_a_rule_that_ended.eml` - Six constraints in the schema encode business rules. How many of those rules are still policy is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the rule in the schema was right and is the advice everybody gives. A constraint in the database holds against every writer, including the ones written after the rule was explained, including the ones written by people who never heard it. That is exactly what makes it worth having.

It also holds after the rule is withdrawn. A policy change is announced to people; the schema is not a person, so it keeps enforcing until somebody migrates it, and until then the rule is in force with no owner claiming it.

Each constraint is checked against current policy.

```
constraints : 6
  encoding a rule that is still policy : 3
  encoding a rule that was withdrawn   : 3
```

```
rows blocked per month : 531
  by constraints whose rule ended : 425, which is 80%
```

```
constraint                    rule still policy   blocks/month   who
  NOT NULL on tax_id   NO                 340           individuals in new markets
  UNIQUE on email   yes                90           duplicate signups
  CHECK amount > 0   NO                 25           free trial conversions
  FK to region   yes                4           malformed imports
  CHECK length(code) = 6   NO                 60           the new eight-character codes
  NOT NULL on signed_at   yes                12           unsigned drafts
```

```
what a blocked write looks like from outside
  the error         : a constraint violation naming a column
  what it says about policy : nothing
  who can explain it : whoever remembers the rule, which is the part that
  expired
```

```
the two directions
  adding a constraint    : proposed by the schema owner, who has the reason
  removing a constraint  : needed by whoever is blocked, who does not own it
  the reason for adding is written in a migration; the reason for removing
  is a policy change that was announced somewhere else entirely
```

```
how each expired constraint could be found
  NOT NULL on tax_id : 340 rejections a month, all of the same shape
  CHECK amount > 0 : 25 rejections a month, all of the same shape
  CHECK length(code) = 6 : 60 rejections a month, all of the same shape
  every one of them is generating a steady signal already, and the signal
  is being read as bad input rather than as an expired rule
```

```
rejections a year from withdrawn rules : 5100
```

```
control - a constraint whose migration records the policy and a review date
  what a reviewer sees : the rule, the date, and the constraint together
  what expires silently : nothing, because the review date is in the same
  file as the enforcement
  the cost is one comment per migration, paid at the only moment when
  somebody definitely knows the reason
```

Putting the rule in the schema is what makes it hold against writers who never heard it. It goes on holding against them after the rule is withdrawn, because a schema is not somebody who can be told.

Verify it yourself:

```bash
pnpm eml run examples/the-schema-still-enforces-a-rule-that-ended/the_schema_still_enforces_a_rule_that_ended.eml
```
