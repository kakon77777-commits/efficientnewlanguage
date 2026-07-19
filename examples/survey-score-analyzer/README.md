# Survey score analyzer

`survey_score_analyzer.eml` analyzes a small customer-satisfaction survey —
`(respondent_name, score)` tuples on a 1-10 scale — splitting respondents
into satisfied/unsatisfied groups, averaging all scores, and previewing the
first couple of responses.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two list comprehensions (satisfied: `score >= 7`,
unsatisfied: `score < 7`) over the same source list; a plain `^+`
accumulation loop (`total^+0` once, `total^+score` per iteration) followed
by a true `/` division against `len(...)` for the average; and a preview of
the first two respondents via a plain Python slice subscript,
`responses[0:2]`, read directly rather than built with a `range()`-bounded
loop.

Verify it yourself:

```bash
pnpm eml transpile examples/survey-score-analyzer/survey_score_analyzer.eml   # -> Python
pnpm eml run examples/survey-score-analyzer/survey_score_analyzer.eml         # -> summary + preview
pnpm eml trace examples/survey-score-analyzer/survey_score_analyzer.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/survey-score-analyzer/survey_score_analyzer.eml   # -> OK (fixpoint)
```
