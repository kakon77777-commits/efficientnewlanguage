# Silent corruption became a visible error graph

`silent_corruption_became_a_visible_error_graph.eml` - Validation was added and the error rate went from near zero to four percent. What changed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding the validation was right and the reviewers who asked for it were right. Malformed records were being written and read back wrong, quietly, for years. A record that fails loudly at the door is strictly better than one that is stored and misread later.

The error graph is a count of what the system now refuses, and before the fix it was a count of nothing, because nothing was refused. The line going up is the same records, at the same rate, meeting a door that now exists.

The records are counted before and after.

```
week   records in   malformed   rejected   corrupted rows written
  1      50000        2000        0         2000
  2      51000        2050        0         2050
  3      49000        1960        0         1960
  4      52000        2080        2080         0
  5      50500        2020        2020         0
  6      51500        2060        2060         0
```

```
validation shipped after week 3
```

```
the error rate, as the dashboard shows it
  weeks 1-3 : 0 per 1000
  weeks 4-6 : 40 per 1000
  a rise from nothing to 4%
```

```
the malformed rate, which is the thing the error rate is about
  weeks 1-3 : 40 per 1000
  weeks 4-6 : 40 per 1000
  unchanged - the senders did not start sending worse data
```

```
corrupted rows written to the store
  before : 6010
  after  : 0
  the fix removed 6010 bad rows over three weeks
  and that number appears on no graph, because a row that is not written
  leaves nothing to count
```

```
what each graph does at the fix
  errors           : 0 -> 2053 a week, a visible regression
  corrupted rows   : 2003 -> 0 a week, and nobody was plotting it
  the improvement is the series that was never instrumented, because before
  the fix there was no event to instrument
```

```
the case for reverting, as it is made
  error rate before the change : ~0
  error rate after             : 4%
  time to revert               : one deploy
  every number in that case is correct
the case against, which needs a number nobody has
  bad rows currently in the store from the earlier weeks : 6010
  cost of each one : whatever reading it wrong costs, discovered later
```

```
instrumenting the thing being prevented, not the prevention
  count malformed records at the door BEFORE enforcing : possible for
  weeks 1-3, by logging without rejecting
  the graph would then already be at 40 per 1000 before the fix,
  and enforcing it would move a different line - the corrupted-rows one -
  which is the line the change is about
```

```
control - the same validation on a clean feed
  malformed records : 0
  the error graph does not move and neither does the corruption graph,
  so this feed cannot show what the change does
```

The validation is right and a record that fails at the door beats one that is stored and misread. The error graph counts what is now refused; before the fix it counted nothing, because nothing was.

Verify it yourself:

```bash
pnpm eml run examples/silent-corruption-became-a-visible-error-graph/silent_corruption_became_a_visible_error_graph.eml
```
