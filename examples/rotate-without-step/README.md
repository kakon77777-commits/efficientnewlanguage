# Rotation: the two-slice idiom, and why it needs a modulo

`rotate_without_step.eml` rotates a sequence with two slices and reverses one without a step — because EML-P slices take two parts and `xs[::-1]` does not parse.

**What it exercises**: `xs[k:] + xs[:k]` is the idiom everyone reaches
for, and it is wrong the moment `k` leaves `[0, len)`:

| k | what the slices do | result |
|---|---|---|
| 12 on a 5-list | `xs[12:]` clamps to `[]`, `xs[:12]` clamps to all | the input, **unrotated** |
| −1 | `xs[-1:]` is the last element, `xs[:-1]` the rest | rotate **right** by 1 |

The first is a silent no-op; the second is a rotation in the wrong
direction that happens to look right for −1. A single `% len(xs)` fixes
both, and the only way to notice it was missing is to compare `k`
against `k + len` — which is exactly property 1 below.

Checked over 21 values of k: rotating by `k` and `k + n` agree,
rotating back restores the original, and the elements are preserved as
a multiset. The naive version disagreed **12 times**.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 14 lines)

```

rotations checked:            21
k and k+n agree:              21/21
rotating back restores:       21/21
elements preserved:           21/21
naive version disagreed:      12 times
reverse positions correct:    5/5

Rotation holds for every k, and the naive two-slice version does not.

`xs[k:] + xs[:k]` is the idiom everyone reaches for, and for k >= len it
quietly returns the input unrotated: the first slice clamps to empty and
the second clamps to everything. A single `% len(xs)` fixes it, and the
only way to notice it was missing is to compare k against k + len.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`rotate_without_step.trace.jsonl` beside this file is the recorded execution.
