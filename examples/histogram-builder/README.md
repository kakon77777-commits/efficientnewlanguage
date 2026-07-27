# Histogram builder

`histogram_builder.eml` buckets 20 scores into equal-width ranges and
draws each bucket as a bar:

```
Score distribution (20 scores, 5 buckets):
0-20:  0
20-40: # 1
40-60: #### 4
60-80: ######## 8
80-100: ####### 7
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: bucketing by index arithmetic
(`int((value - low) / width)`), and one specific off-by-one that this kind
of code almost always has to handle.

**The top edge.** Bucket ranges are half-open (`[low, high)`) everywhere
*except* at the very end. A value exactly equal to the upper bound
computes index `bucket_count` — one past the last bucket. Clamping it into
the final bucket is what makes a perfect score land somewhere rather than
being dropped or indexing out of range, and the sample data contains a
`100` for precisely that reason.

**The counts are checked against the input length.** Every value must land
in exactly one bucket, so the bucket counts have to sum back to the number
of scores. That single check catches both a dropped top edge and any
double-counting — neither of which "it drew some bars" would reveal, since
a histogram missing one value still looks entirely plausible.

Verify it yourself:

```bash
pnpm eml transpile examples/histogram-builder/histogram_builder.eml   # -> Python
pnpm eml run examples/histogram-builder/histogram_builder.eml         # -> 5 labelled bars + a total check
pnpm eml trace examples/histogram-builder/histogram_builder.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/histogram-builder/histogram_builder.eml   # -> OK (fixpoint)
```
