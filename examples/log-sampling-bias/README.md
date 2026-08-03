# Same number of records, different questions

`log_sampling_bias.eml` samples a request stream two ways and measures which questions each sample can still answer.

**What it exercises**: both samplers keep the same number of records —
so record count is not what separates them. Keeping every 10th request
aliases with a latency pattern of period 10, so the sample sees **1 of
10 phases** and reports it as the whole distribution. A phase-rotated
sampler sees all 10.

The error rate is where it bites: scaled from the aliased sample it is
**150% too high**; from the rotated one, 25% off. Neither can recover
the maximum — a tail metric is not a sampling problem you fix by
sampling better.

The rule lives in the collector and the question lives in the dashboard,
and nothing in the log says which questions the sampling preserved.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
distinct latency phases in the sample (10 exist):
  every 10th:     1
  phase-rotated:  10

requests inside an error burst: 40/500
  every 10th sampled:           10
  phase-rotated sampled:        5

checks passed: 5/5
Same number of records, different questions answerable. The count is not the sample.

A sampled log reports a number for every question you ask it, and the
number is only meaningful for the questions the sampling rule preserves.
Nothing in the log says which those are - the rule lives in the collector,
the question lives in the dashboard, and the two are usually written years
apart by different people.
```
