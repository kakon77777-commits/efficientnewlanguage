# The same rule blocks here and warns there

`the_same_rule_blocks_here_and_warns_there.eml` - One policy, six pipelines, three enforcement levels. Where the violations end up is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The graduated rollout was right and is what everybody recommends. A rule that blocks on day one blocks the teams who had no warning, so it starts as a warning, becomes a soft failure, and blocks last. Each team got time proportional to how much work the rule created for it.

What was graduated by intent was the schedule. What it produced is a standing difference in what the rule means per pipeline, because the last step never happened for the pipelines where it was hardest - which are the pipelines with the most violations.

Violations are counted per pipeline at each enforcement level.

```
pipelines : 6
violations reaching production per week : 77
```

```
pipeline          enforcement   violations/week   months at this level
  web   blocks        0                14
  mobile   blocks        0                12
  internal tools   soft-fails        3                11
  data pipeline   warns        26                13
  legacy billing   warns        41                13
  partner sync   soft-fails        7                9
```

```
by enforcement level
  warns : 2 pipeline(s), 67 violations/week
  soft-fails : 2 pipeline(s), 10 violations/week
  blocks : 2 pipeline(s), 0 violations/week
```

```
the pipelines that only warn carry 67 of the 77 violations
  which is 87%
```

```
pipelines still below full enforcement : 4 of 6
months since the rollout began : 14
  the schedule had three steps and no step has moved for the stalled ones
```

```
why each one stalled, stated as its violation count
  internal tools : 3 violations a week would have to be fixed first
  data pipeline : 26 violations a week would have to be fixed first
  legacy billing : 41 violations a week would have to be fixed first
  partner sync : 7 violations a week would have to be fixed first
  the cost of advancing is proportional to the violations, so the pipelines
  furthest from compliance are the ones it is most expensive to advance
```

```
the rollout, as reported
  pipelines the policy is applied to : 6 of 6, which is 100%
  pipelines where a violation cannot reach production : 2
  the first number is what gets reported and the second is what the rule
  does
```

```
what a developer experiences
  web : cannot merge
  mobile : cannot merge
  internal tools : a red check they can override
  data pipeline : a line in a log
  legacy billing : a line in a log
  partner sync : a red check they can override
  the same policy document produces three different experiences, and which
  one a developer gets is decided by which repository they opened
```

```
advancing the two warn-only pipelines to soft-fail
  violations that would start being surfaced : 67 a week
  violations that would be blocked           : 0, soft-fail is overridable
  what it changes is who sees them, which is the step that was skipped
```

```
control - a policy that blocked on every pipeline from day one
  enforcement levels in play : 1
  pipelines that can accumulate violations : 0
  the cost was paid at once by the teams with the most work, which is the
  cost the graduated rollout was designed to spread - and spreading it is
  what left it unpaid
```

The graduated rollout gave each team time proportional to its work, which is the fair schedule. The last step is hardest exactly where there is most to fix, so it is unfinished where it would matter most.

Verify it yourself:

```bash
pnpm eml run examples/the-same-rule-blocks-here-and-warns-there/the_same_rule_blocks_here_and_warns_there.eml
```
