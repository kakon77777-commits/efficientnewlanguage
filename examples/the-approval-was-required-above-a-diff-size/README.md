# The approval was required above a diff size

`the_approval_was_required_above_a_diff_size.eml` - A change above two hundred lines needs a second approver from another team, enforced in the pipeline, and that review has found twelve real problems. Which changes it sees is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The gate is real change management. It is not a form somebody signs after the fact: the pipeline refuses to deploy without the second approval, the second approver must be outside the authoring team so it is not a colleague nodding, the requirement cannot be waived by the author, and the reviews have found twelve genuine problems in a hundred and forty escalated changes.

The threshold is LINES CHANGED. A one-line change to a constant can change behaviour for every user, and a nine-hundred-line rename cannot.

Fourteen of last year's seventeen change-caused incidents came from below it.

```
line threshold                  : 200
waivers available to the author : 0
changes escalated for review    : 140
  real problems it found        : 12
```

```
changes per year                : 8400
  above the threshold           : 1100
  below it                      : 7300
  share the gate sees           : 1309 per ten thousand
```

```
change-caused incidents         : 17
  from changes above the threshold : 3
  from changes below it            : 14
  share from below                 : 8235 per ten thousand
```

```
the approval gate
  signed after the fact : no; the pipeline refuses to
    deploy without it
  who the second approver must be : outside the authoring
    team
  waivable by the author : 0
  changes escalated : 140
  real problems found : 12
  verdict : ENFORCED, AND IT FINDS THINGS
```

```
  requiring an approver from another team is what stops
  this being a colleague nodding, and it is why the twelve
  are real
```

```
the selection rule
  what it measures : lines changed
  what it is used as : a proxy for how much behaviour
    could change
  a one-line change to a constant : below the line, and
    can change behaviour for everyone
  a nine-hundred-line rename : above the line, and cannot
  is the proxy wrong in one direction : it is wrong in
    both
```

```
  the gate is complete over the changes it selects and the
  selection is on a quantity that is easy to count
```

```
the incidents from below the line
  count : 14 of 17
  did any of them skip a required approval : none
  did any author act carelessly : the reviews after the
    fact say no
  what they had in common : fewer than 200 lines
  what the gate would have to read to see them : what the
    lines do
```

```
lowering the line
  to catch a one-line constant change : the threshold
    must be one line
  changes that would then escalate : 8400
  approvers available : the same people
  what happens to review quality at that volume : it
    becomes the rubber stamp the rule was written against
  so the threshold is not too high : it is the wrong axis
```

```
null control - selection by blast radius, not by size
  second approver from another team : unchanged
  axes the gate selects on : 1, and it is not line count
  change-caused incidents the gate could see : 
    17 of 17
  the review did not get better; the rule that decides
  which changes reach it stopped counting characters
```

```
what a size-triggered approval guarantees
  every large change was reviewed by an outsider :
    exactly, unwaivable, and it found 12 real problems
  every risky change was reviewed : not addressed; the
    trigger is a count of lines and risk is a property of
    what they say
```

```
a gate is only as good as the predicate that routes to it,
and a predicate chosen for being cheap to evaluate selects
on a proxy; the proxy's errors are not random but sit
exactly where a small edit does something large
```

The gate is real: the pipeline refuses to deploy without a second approver from another team, 0 waivers exist, and 140 escalations found 12 genuine problems. It triggers on 200 lines changed, so it sees 1309 per ten thousand of 8400 changes a year, and 14 of 17 change-caused incidents - 8235 per ten thousand - came from changes too small to reach it.

Verify it yourself:

```bash
pnpm eml run examples/the-approval-was-required-above-a-diff-size/the_approval_was_required_above_a_diff_size.eml
```
