# Renaming the category changed the trend - a 50% drop that is entirely definitional

`renaming_the_category_changed_the_trend.eml` counts every month under both rules, so the definitional part of the step separates from the real part.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tightening the definition was the right call - "critical" had drifted to mean anything an engineer was paged for. The new rule is better than the old one. The series it feeds was not restated, so the chart splices two rules end to end.

```
month   old rule   new rule   as reported
  1        4          2          4
  2        4          2          4
  3        4          2          4
  4        4          2          2
  5        2          1          1
  6        2          1          1
```

```
the step everyone sees
  month 3 : 4
  month 4 : 2
  drop : 50%
```

```
the same two months under one rule
  old rule : 4 -> 4
  new rule : 2 -> 2
  under either rule, nothing changed between those months
```

```
  observed drop      : 2
  definitional part  : 2
  real part          : 0
  the entire step is the definition
```

```
the series, restated under one rule throughout
  old rule throughout : 4 4 4 4 2 2 
  new rule throughout : 2 2 2 2 1 1 
  as reported         : 4 4 4 2 1 1 
```

```
the real change
  old rule, month 4 -> 5 : 4 -> 2
  new rule, month 4 -> 5 : 2 -> 1
  a real drop, visible under BOTH rules
  the definitional step and the real one are the same size, and the
  definitional one comes first
```

```
control - the same change with months 1-3 recounted under the new rule
  restated series : 2 2 2 2 1 1 
  no step at month 4
  and the month 5 change is still visible
```

The new definition is better than the old one. The chart splices two rules end to end, and a splice looks exactly like an event.

**Two printed claims here were contradicted by the data on first run** - "visible under both rules" when only the old rule saw it, and a control line asserting a change that was not there. Both are now computed branches, and the data was changed so that a real, rule-independent drop exists to point at.

Verify it yourself:

```bash
pnpm eml run examples/renaming-the-category-changed-the-trend/renaming_the_category_changed_the_trend.eml
```
