# Sequence repetition

`text_banner_builder.eml` covers `"-" * n` and `[0] * n` — which no
corpus program had used, and which is the workhorse behind every box,
rule, bar chart and padded column.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: repetition looks trivial until the edge cases, and
each one is checked rather than avoided.

```
  "ab" * 3  = "ababab"
  "ab" * 0  = ""   (empty, length 0)
  "ab" * -4 = ""   (also empty - negative does not raise)
  [7] * 4    = [7, 7, 7, 7]
  [7] * 0    = []
```

`n = 0` gives an **empty** sequence, not a one-element one, and `n < 0`
also gives empty — it does not raise and does not count backwards.

The banner is drawn to a width derived from the longest line rather than
a hardcoded number, so the box closes exactly regardless of content —
which is also what makes a wrong repetition count show up as a ragged
edge instead of an invisible off-by-one.

In the bar chart the repetition count **is** the data, so a zero-valued
day is a zero-length bar rather than a missing row:

```
  mon  |### 3
  tue  |####### 7
  wed  | 0
  thu  |############ 12
  fri  |##### 5
```

## The shared-inner-list trap

```
  [[0]*3]*2   after setting [0][0]=9 -> [[9, 0, 0], [9, 0, 0]]
  built row by row                    -> [[9, 0, 0], [0, 0, 0]]
```

`[x] * n` repeats the **reference**, not the value. Repeating a list of
lists gives you the same inner list `n` times, so writing to one row
writes to all of them — the classic grid-building bug. The case builds
its grid row by row instead, and prints both so the difference is visible
rather than warned about.

Verify it yourself:

```bash
pnpm eml transpile examples/text-banner-builder/text_banner_builder.eml
pnpm eml run examples/text-banner-builder/text_banner_builder.eml         # -> box, edge cases, chart, the trap
pnpm eml trace examples/text-banner-builder/text_banner_builder.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/text-banner-builder/text_banner_builder.eml   # -> OK (fixpoint)
```
