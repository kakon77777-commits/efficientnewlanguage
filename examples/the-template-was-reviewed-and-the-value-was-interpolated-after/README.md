# The template was reviewed and the value was interpolated after

`the_template_was_reviewed_and_the_value_was_interpolated_after.eml` - No notification template reaches production without a security review, the review has run for twenty-six months, and it has caught and fixed seven injections. What the review reads is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The review is real. Two reviewers sign every template against a written checklist; a template cannot be referenced by any service until both have signed; nineteen were sent back and rewritten rather than waved through; and seven templates whose own text would have executed something were caught.

What the reviewer opens is the template. What the recipient receives is the template with values substituted into it, and the substitution happens after every signature has been collected.

```
templates in the catalogue      : 340
reviewers per template          : 2
sent back and rewritten         : 19
months the review has run       : 26
injections found in the text    : 7
```

```
placeholders across the catalogue : 2180
  per template, mean             : 6
  that escape                    : 2084
  rendered without escaping      : 96
  that a stranger can fill       : 41
  unescaped share                : 440 per ten thousand
```

```
templates holding at least one  : 23
  holding none                  : 317
  share affected                : 676 per ten thousand
checklist items about escaping  : 0
reviews that rendered the file  : 0
```

```
the template review
  signatures : 2 per template, and no service may
    reference a template until both are collected
  checklist : written, and applied to the text of the
    template as the reviewer reads it
  sent back rather than waved through : 19
  injections found in template text : 7, all fixed
  months in place : 26
  verdict : REVIEWED
```

```
  blocking the reference until both signatures exist is
  the part almost nobody does, and it is why the 7
  were found before anything shipped
```

```
two objects
  what the reviewer opens : the template
  what the recipient receives : the template with 6
    values substituted into it
  when the substitution happens : after every signature
    has been collected
  what the checklist says about the substitution : 0
    items
  reviews that rendered the template to look : 0
```

```
  the reviewed object and the sent object differ by
  exactly the part a stranger writes
```

```
a placeholder that does not escape
  is the template text clean : yes, and both reviewers
    were right to sign it
  where does the value come from : a field the
    counterparty fills in
  is the field validated : for length, at the form
  is it escaped at render : no; escaping is chosen per
    placeholder and this one selects raw
  placeholders in that state : 96
  of those, fillable by a stranger : 41
```

```
null control - render every template with a probe value
  injections found in the text : 7, unchanged
  placeholders rendered and diffed : 2180
  that emitted the probe raw : 96
  the review did not get better at reading templates; the
  object it reads stopped being the only one anybody
  looked at
```

```
what a fully reviewed catalogue guarantees
  every template's own text is free of injection :
    exactly, 2 signatures each, 26 months, 7 found
  every message sent is free of injection : not
    addressed; the message is the template after
    substitution and nothing here renders one
```

```
reviewing the form and shipping the filled-in form are
two readings of two objects; the signature is about the
one that was read
```

Two reviewers sign every template against a written checklist, 19 were sent back, and 7 injections in template text were caught in 26 months. The values are substituted after the last signature, so of 2180 placeholders 96 render unescaped - 440 per ten thousand, across 23 templates - and 41 of them take a value a stranger writes.

Verify it yourself:

```bash
pnpm eml run examples/the-template-was-reviewed-and-the-value-was-interpolated-after/the_template_was_reviewed_and_the_value_was_interpolated_after.eml
```
