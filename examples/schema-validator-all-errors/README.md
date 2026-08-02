# Report every error, not the first one

`schema_validator_all_errors.eml` validates records against a small schema twice - stopping at the first problem, and collecting all of them - and checks the thing that separates the two.

**What it exercises**: fail-fast and fail-complete validators agree on
every verdict. A record is valid or it is not, and both say the same
word. So a test suite built on verdicts cannot tell them apart at all.

The difference is the **count**. Record 2 has three problems; fail-fast
reports one. The user fixes it, resubmits, and is told about the next
one - three round trips for one form. And a fixture set where each
record carries a single defect makes the two implementations
indistinguishable, which is exactly how a fail-fast validator survives
review.

So the checks here are structural: the complete validator's error count
is always **at least** the fast one's, the fast one never returns more
than one, and both verdicts agree on every record. The first two are
what a verdict-only suite cannot see.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  record 5:
      email: not an email address (alan@at@example.com)

Errors fail-fast would have hidden on a first submission: 2

records checked:                  5
verdicts agree:                   5/5
complete found >= fast:           5/5
fast returned at most one:        5/5

Both agree on validity; only fail-complete says how much is wrong.

Record 2 has three problems and record 4 has one. A fail-fast validator
reports one error for both, so a test suite whose fixtures each contain a
single defect cannot tell the two implementations apart - which is why the
check here is on the COUNT, not on the verdict.
```
