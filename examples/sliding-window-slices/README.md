# Sliding windows: the bug is always at the ends

`sliding_window_slices.eml` builds sliding windows over a sequence entirely from slices, and checks them where every windowing bug lives — at the two boundaries.

**What it exercises**: a window function is four lines and three
off-by-ones. The middle of the sequence is easy and always right; the
failures are all at the edges, and **none of them raise**, because
`xs[i:i+k]` is defined for every `i` and every `k`.

The whole case is the guard `i + k <= len(xs)`. Write `i < len(xs)`
instead and the last window comes back short rather than not coming
back at all — and since a slice past the end clamps silently, the only
symptom is a count one too high and a final window nobody looked at.

So the checks are on the **shape** of the result, computed
independently: a full pass yields exactly `len(xs) - k + 1` windows
each of length exactly `k`; a stepped pass covers every element once
and concatenates back to the input.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  windows_stepped(data, 99, 99) -> [[3, 1, 4, 1, 5, 9, 2, 6]]
  the single window is the whole input: True

What the slice does past the end, directly:
  data[6:99]  = [2, 6]
  data[8:99]  = []   (start AT the end)
  data[99:99] = []   (both past the end)
  data[5:2]   = []   (start past stop)

checks passed: 5/5
Window counts and lengths are right at both ends.

The guard `i + k <= len(xs)` is the whole case. Write `i < len(xs)` and the
last window comes back short instead of not coming back at all - and since
a slice past the end never raises, the only symptom is a count that is one
too high and a final window nobody looked at.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`sliding_window_slices.trace.jsonl` beside this file is the recorded execution.
