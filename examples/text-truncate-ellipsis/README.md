# Truncating with an ellipsis: three silent bugs in one line

`text_truncate_ellipsis.eml` truncates text to a column budget, and shows what the four-line version everyone writes actually does.

**What it exercises**: `s[:width - 3] + "..."` is wrong three ways at
once, and all three are silent because a slice never raises.

1. it truncates strings that already **fit**, appending `...` to a
   short string
2. when `width < 3` the stop bound goes negative, which **wraps** and
   quietly cuts from the *right* end instead of erroring
3. when `width` is 0 it produces `...` — three characters wider than
   the budget it was given

The run below shows the naive version exceeding its budget **15 times**
across the same 155 cases the correct one passes.

The invariant, checked over every width 0–30 and every sample:
`len(result) <= width` always, `result == s` whenever it fits, and the
visible part is a prefix of the input — with the honest exception that
when the budget is too small for one character the result is dots only
and is a prefix of nothing. Stating that rule as "always a prefix"
failed 7 of 155 cases, and the 7 were the rule being wrong.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 12 lines)

```
Checked over every width 0..30 and every sample:
  cases checked:            155
  never exceeds the budget: 155/155
  unchanged when it fits:   155/155
  visible part is a prefix: 155/155
  naive version over budget: 15 times

Budget held in every case; the naive version broke it repeatedly.

`s[:width - 3]` with width=2 becomes `s[:-1]`, which is a valid slice that
cuts one character off the END. It does not raise, it does not warn, and
the result is a string that looks like a truncation and is not one.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`text_truncate_ellipsis.trace.jsonl` beside this file is the recorded execution.
