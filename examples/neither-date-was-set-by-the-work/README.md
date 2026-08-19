# Neither date was set by the work

`neither_date_was_set_by_the_work.eml` - Each team set its date from the other team's date. Where either date came from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Aligning to the dependency is correct planning. A team that ships before the thing it integrates with is finished has shipped nothing, and a team that ships long after has wasted the gap. Reading the other side's date and planning against it is what coordination means.

A date read from a plan is not evidence about work. When both sides do it, the pair holds two dates that agree with each other and neither of which was derived from an estimate, so the first contact with the work moves both.

The work-derived dates are computed alongside so the gap is visible.

```
real work remaining : team A 14 weeks, team B 9 weeks
announced dates     : team A week 16, team B week 18
integration margin  : 2 weeks
```

```
what each announced date was derived from
  team A : team B's date 18 minus the margin 2 = 16
  team B : team A's date 16 plus the margin 2 = 18
  the pair is consistent, and each date's only support is the other
```

```
what the work implies
  team A : 14 weeks of work, so week 14
  team B : 9 weeks of work, so week 9
  the binding one is team A at week 14
  the announced date for A is 2 weeks later than its own work needs
  and B's is 7 weeks later than B's work plus the margin
```

```
team B discovers 3 more weeks of work, taking it to 12
```

```
if each side re-derives from the other, one round at a time
  round 1 : A week 16, B week 18
  round 2 : A week 16, B week 18
  round 3 : A week 16, B week 18
  round 4 : A week 16, B week 18
```

```
  neither date moved. 3 weeks of work appeared and the pair is
  unchanged, because each date is supported by the other and the
  margin between them still holds
```

```
where it comes to rest
  team A : week 16, against 14 weeks of work
  team B : week 18, against 12 weeks of work plus 2
  A is still 2 weeks past what its own work needs, because it is
  anchored to B and B is anchored to the margin
```

```
if both dates were derived from estimates and reconciled once
  team A : week 14, team B : week 14
  the pair ships at week 14
  against week 18 under the mutual anchoring, a difference of 4
```

```
what a reader can conclude from the two announced dates
  that the teams agree : yes
  that either date is achievable : nothing
  the agreement was produced by copying, which is also what agreement
  produced by evidence looks like from outside
```

```
control - team A dates from its own estimate, B aligns to A
  before the discovery : A week 14, B week 11
  after                : A week 14, B week 14
  the discovery moved the pair by 3, which is the discovery
```

Planning against the dependency is what coordination is, and the two dates are consistent to the week. Consistency between two copies is not evidence about the work, and the work is what the dates are about.

Verify it yourself:

```bash
pnpm eml run examples/neither-date-was-set-by-the-work/neither_date_was_set_by_the_work.eml
```
