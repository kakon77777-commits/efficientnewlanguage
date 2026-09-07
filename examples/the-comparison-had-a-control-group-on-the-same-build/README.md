# The comparison had a control group on the same build

`the_comparison_had_a_control_group_on_the_same_build.eml` - Every deploy runs a canary analysis against a control group across forty-one metrics and it has rolled back seven real regressions. What the two groups differ in is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The canary analysis is the good kind. It is automated rather than a person squinting at a graph; it compares against a concurrent control group rather than against yesterday, so a traffic shift affects both; it covers forty-one metrics rather than error rate alone; it fails closed, rolling back on a regression rather than asking; and seven rollbacks this year were each a real regression that would have reached everybody.

The two groups differ in the deploy ARTIFACT. A change delivered by the configuration service reaches both groups at once, so for that class the canary and its control are the same software.

Three thousand one hundred changes a year arrive that way.

```
rollbacks the canary caught     : 7
metrics compared                : 41
canary duration, minutes        : 20
groups compared                 : 2
```

```
changes per year                : 4340
  delivered as a deploy artifact: 1240
  delivered by the config service: 3100
  share outside the comparison  : 7142 per ten thousand
```

```
builds running during a config change : 1
  groups that differ then       : 0
config changes the canary can separate : 0
```

```
the canary analysis
  automated or a person squinting : automated
  compared against : a concurrent control group, not
    yesterday, so a traffic shift moves both
  metrics : 41, not error rate alone
  on a regression : rolls back, without asking
  rollbacks this year : 7, each a real regression
  verdict : DISCRIMINATES
```

```
  a concurrent control rather than a historical baseline
  is the choice that makes this robust, and it was made
```

```
the treatment
  what the deploy tool varies : the artifact one group
    runs
  what a config change varies : a value both groups read
  when a config value changes, builds running : 
    1
  groups that differ then : 0
  what the analysis then measures : two samples of one
    population
```

```
  the comparison is sound and its treatment is defined by
  the tool that delivers it
```

```
a config change during a canary
  analysis runs : yes
  metrics compared : 41
  a regression caused by the change : present in both
    groups
  difference between the groups : none, because the
    regression is common to them
  verdict returned : pass
  is the verdict wrong : no; the groups genuinely do not
    differ
```

```
the two streams
  deploy artifacts a year : 1240
  config changes a year   : 3100
  why config is larger : it is the path that does not
    require a build, which is what it is for
  which path feels riskier to a person : the deploy
  which path the canary covers : the deploy
  share of changes outside it : 7142 per ten
    thousand
```

```
the rollbacks
  count : 7
  each a real regression : yes
  each would have reached everybody : yes
  what they establish : the analysis can discriminate
  what they do not establish : that it was ever asked
    about the 3100
```

```
null control - config is delivered to one group first
  metrics compared : 41, unchanged
  groups that differ during a config change : 2
  changes the canary can separate : 4340
  the analysis did not improve; the treatment started
  being applied to one group instead of to the world
```

```
what a passing canary analysis guarantees
  the canary group does not differ from the control :
    exactly, over 41 metrics, concurrently, failing closed
  the change is safe : not addressed; a comparison can
    only see what distinguishes its two arms, and this
    one is defined by the deploy tool
```

```
an experiment measures a treatment, so its power is bounded
by what actually differs between the arms; a change that
reaches both arms is not weakly detected but perfectly
invisible, and it passes rather than failing to run
```

The analysis is automated, concurrent rather than historical, covers 41 metrics, fails closed, and rolled back 7 real regressions this year. Its two groups differ in the deploy artifact, so of 4340 changes a year the 3100 delivered by the config service - 7142 per ten thousand - reach 1 build across both arms, leaving 0 differences for the comparison to find.

Verify it yourself:

```bash
pnpm eml run examples/the-comparison-had-a-control-group-on-the-same-build/the_comparison_had_a_control_group_on_the_same_build.eml
```
