# Simple quiz grader

`simple_quiz_grader.eml` grades a 5-question quiz from `(question,
correct_answer, given_answer)` tuples, printing per-question feedback and a
final percentage score.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `and`/`or`/`not` boolean logic composed across three
intermediate booleans (`is_blank`, `is_wrong_answer`, `is_incorrect`,
`is_correct`) — a skipped/blank answer and a non-blank mismatch both count
as incorrect via `or`, and only a non-blank exact match counts as correct
via `not`; exact-match string comparison rather than `.lower()`
case-folding (verified empirically that `.lower()` is not modeled by
`@eml/interp` — the object is a bare `str` value, not a class `instance`,
so a method call on it defers as `Unsupported` rather than running, which
would have kept `eml trace --run`'s equivalence check from reaching a
clean 0-anomaly pass); and a final percentage computed with true `/`
division and `*`, deliberately avoiding `%` (floor-mod) for the arithmetic
even though `%` is used elsewhere in the corpus for string formatting.

Verify it yourself:

```bash
pnpm eml transpile examples/simple-quiz-grader/simple_quiz_grader.eml   # -> Python
pnpm eml run examples/simple-quiz-grader/simple_quiz_grader.eml         # -> per-question feedback + score
pnpm eml trace examples/simple-quiz-grader/simple_quiz_grader.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/simple-quiz-grader/simple_quiz_grader.eml   # -> OK (fixpoint)
```
