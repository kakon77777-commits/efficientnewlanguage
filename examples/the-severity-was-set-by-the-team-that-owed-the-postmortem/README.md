# The severity was set by the team that owed the postmortem

`the_severity_was_set_by_the_team_that_owed_the_postmortem.eml` - Incident severity is written down, exemplified, and cannot be lowered after the fact without a second approver, and it has worked that way for four years. Who assigns it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The definitions are good. Each level has worked examples rather than adjectives; the level is set at declaration rather than argued about afterwards; lowering one later needs a second approver and six such changes were made and recorded; and a level-one incident really does get an executive review and a written postmortem within five days.

The level is set by the team that owns the service, and the postmortem is owed by the team that owns the service.

```
incidents last year             : 1180
  declared level one            : 34
  declared level two            : 210
  declared level three          : 936
  below level one               : 1146
  level-one share               : 288 per ten thousand
```

```
a level one owes                : a postmortem in 5 days
  hours a postmortem costs      : 20
  postmortem hours owed         : 680
incidents that owed no postmortem : 1146
```

```
level twos above the median level one, by customer impact
  count                         : 41
  share of level twos           : 1952 per ten thousand
  postmortems written for them  : 0
  hours that would have cost    : 820
```

```
levels lowered after the fact   : 6
levels raised after the fact    : 0
  net, downward                 : 6
```

```
the severity scheme
  each level : worked examples, not adjectives
  when it is set : at declaration, not argued about
    afterwards
  lowering one later : needs a second approver, and 
    6 were changed and recorded
  what a level one actually gets : an executive review
    and a written postmortem within 5 days
  verdict : DEFINED
```

```
  requiring a second approver to LOWER a level is the
  part almost nobody does, and it is why the 
  6 are visible
```

```
the declaration
  who sets the level : the team that owns the service
  who owes the postmortem : the team that owns the
    service
  who attends the executive review : the team that owns
    the service
  so the classification and its cost : land on the same
    people, at the moment of classifying
  hours at stake per level one : 20
```

```
  the second approver guards the change of a level and
  not the setting of one; the first number is the one
  nobody countersigns
```

```
comparing on impact rather than on label
  level twos above the median level one : 
    41
  as a share of level twos : 1952 per ten thousand
  postmortems they produced : 0
  executive reviews they produced : 0
  hours not spent on them : 820, against 
    680 spent on the declared level ones
  were any of them reclassified upward : 
    0
```

```
null control - let someone who owes nothing set the level
  incidents : 1180, unchanged
  declared level one : 71
  levels lowered after the fact : 
    1
  the definitions did not change and neither did the
  incidents; the person applying them stopped paying for
  the answer
```

```
what a well-defined severity scheme guarantees
  every incident the owning team called level one got a
    postmortem : exactly, 34 of them, in 5 days, with
    an executive review
  every severe incident got one : not addressed; the
    level is chosen by the party that owes the work, and
    41 level twos were larger than the median level one
```

```
definitions do not classify; people do, and a definition
applied by whoever pays for the answer measures what they
were willing to owe
```

Each level has worked examples, the level is set at declaration, lowering one later needs a second approver and 6 were recorded. The team that sets it is the team that owes the postmortem, so 34 of 1180 incidents were level one - 288 per ten thousand - while 41 level twos exceeded the median level one on customer impact and produced 0 postmortems and 0 upward reclassifications.

Verify it yourself:

```bash
pnpm eml run examples/the-severity-was-set-by-the-team-that-owed-the-postmortem/the_severity_was_set_by_the_team_that_owed_the_postmortem.eml
```
