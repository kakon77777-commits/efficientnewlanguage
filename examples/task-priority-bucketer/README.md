# Task priority bucketer

`task_priority_bucketer.eml` takes a sample task list — `(task_name,
priority_number)` tuples on a 1-10 scale — and sorts them into
high/medium/low priority buckets for a simple daily triage report.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: three separate list comprehensions over the same
source list, each filtering on `entry[1]` with its own threshold `if`
condition (a plain comparison for the high/low buckets, a compound
`and`-joined range check for the medium bucket) — EML's comprehension
grammar allows a single `for` plus at most one `if`, so the medium-bucket
range check has to be one combined boolean expression rather than two
chained `if`s; and a `for` loop over each resulting bucket printing
`entry[0]` (tuple-element read via subscript).

Verify it yourself:

```bash
pnpm eml transpile examples/task-priority-bucketer/task_priority_bucketer.eml   # -> Python
pnpm eml run examples/task-priority-bucketer/task_priority_bucketer.eml         # -> three priority buckets
pnpm eml trace examples/task-priority-bucketer/task_priority_bucketer.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/task-priority-bucketer/task_priority_bucketer.eml   # -> OK (fixpoint)
```
