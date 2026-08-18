# The runbook grew one step per incident

`the_runbook_grew_one_step_per_incident.eml` - Fourteen steps, one per incident. How many of them the next incident needs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Every step earned its place. Each was written by someone at three in the morning who had just discovered that this check would have saved an hour, and each is correct: run it and you learn something true about the system.

A runbook is read in order under time pressure by somebody who does not know which incident they are in. The steps that matter for tonight are a subset, the reader cannot tell which subset, and the ones that do not apply still cost their minutes because they are above the ones that do.

Each step is scored against each incident type rather than in general.

```
steps in the runbook : 14
minutes to run it end to end : 35
```

```
incident kind          steps that apply   minutes that apply   minutes spent
  a database incident   4 of 14            9                  35
  a queue incident   4 of 14            11                  35
  a deploy incident   2 of 14            7                  35
  a network incident   4 of 14            9                  35
```

```
minutes spent on steps that cannot apply
  a database incident : 26
  a queue incident : 24
  a deploy incident : 28
  a network incident : 26
  worst case : 28 of 35
```

```
steps that apply to every kind : 0
steps that apply to no kind    : 1
  each of those was right for an incident not in this list, which is the
  reason they are here and the reason nobody removes them
```

```
if the first line asked which kind of incident this is
  a database incident : 9 minutes instead of 35
  a queue incident : 11 minutes instead of 35
  a deploy incident : 7 minutes instead of 35
  a network incident : 9 minutes instead of 35
  average saved per incident : 26 minutes, with every step kept
```

```
the order the steps are in
  the order they were added, which is the order the incidents happened
  that order is a fact about the past and carries no information about
  tonight
```

```
control - a runbook written for database incidents only
  steps : 3, minutes : 6, steps that cannot apply : 0
  here reordering saves nothing, because there is nothing to skip
```

Every step was added by somebody who was right and every step is true. Which of them tonight needs is a question the runbook never asks, so it runs all of them in the order the last few years happened.

Verify it yourself:

```bash
pnpm eml run examples/the-runbook-grew-one-step-per-incident/the_runbook_grew_one_step_per_incident.eml
```
