# A list of tuples is a table

`exam_score_records.eml` holds `(name, score, attempts)` rows and reports
on them.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the list-of-tuples shape that most tabular data
takes, with accessor functions standing in for named fields.

```
Passed: 3 of 5
Highest 91, lowest 47, mean 70.4
Total sittings: 8 for 5 candidates
A row has a fixed width of 3; the TABLE is what grows, not the row.
```

The two containers are doing genuinely different jobs, which is the point
of writing it out:

- The **list** is what grows. Adding a candidate is normal.
- The **tuple** stays the same size forever. A row with four fields would
  be a different kind of row, not a longer one.

The accessor functions (`name_of`, `score_of`, `attempts_of`) exist so the
positional indices appear once each instead of scattered through the
program — the cheapest available substitute for named fields.

Verify it yourself:

```bash
pnpm eml run examples/exam-score-records/exam_score_records.eml
pnpm eml trace examples/exam-score-records/exam_score_records.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/exam-score-records/exam_score_records.eml   # -> OK (fixpoint)
```
