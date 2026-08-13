# The handoff loses what has no field — 4 of 6 decidable, and one new field bought 0

`the_handoff_loses_what_has_no_field.eml` runs each of the receiver's decisions
twice: from the transmitted subset, and from everything the sender knew.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the form is the reason the handoff works at all — without
it every report is a different shape and the receiver spends their time
reconstructing rather than acting. The fields were chosen by people who had seen
a lot of reports, and *before* anyone knew which facts this report would need to
carry.

```
facts the sender knew : 10
  with a field on the form : 5
  with no field            : 5
    which other inputs were tried and passed
    how the sender chose those inputs
    which nearby cases the sender did not run
    how long the sender searched
    what the sender assumed the receiver already knew
```

```
  reproduce it : decidable from the form
  confirm it is wrong : decidable from the form
  find the cause : decidable from the form
  decide how wide the class is : NOT decidable from the form, decidable from what the sender knew
  decide whether to keep searching : NOT decidable from the form, decidable from what the sender knew
  schedule it : decidable from the form

  decidable from the form               : 4 of 6
  decidable from everything the sender knew : 6 of 6
```

**Adding a field is cheap, and here it bought nothing:**

```
after adding one field for the most obviously useful missing fact
  decidable : 4 of 6
  gained    : 0
  still short of what the sender knew : 2
```

Zero — because that decision needs *two* of the missing facts, and a field added
one at a time clears a decision only when it happens to be the last one missing.

**And what falls outside the form has a shape:**

```
the facts with no field, described
  about the defect itself : 1
  about the SEARCH        : 4
  the form carries the finding and drops the finding process
```

Nothing is declared: which facts a decision needs is a property of the decision,
whether a fact has a field is a property of the form, and both are read rather
than assumed.

A form is a claim about which facts will matter, made before the facts exist. It
is usually right, and the cases where it is wrong are exactly the ones where the
sender knew something the receiver needed.

Verify it yourself:

```bash
pnpm eml run examples/the-handoff-loses-what-has-no-field/the_handoff_loses_what_has_no_field.eml
```
