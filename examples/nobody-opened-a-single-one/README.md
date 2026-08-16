# Nobody opened a single one - 2 records show what the summary has no column for

`nobody_opened_a_single_one.eml` computes the summary and a small sample from the same rows, and checks whether the extra field is redundant with the categories rather than assuming it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: summarising is not laziness - nobody reads every record every week, and the summary was built so the review could happen at all. Every number in it is correct. A summary reports the columns it was given, and the pattern here lives in a column the schema does not have.

```
the weekly summary
  records : 12
  timeout : 7 records, 84 minutes
  parse : 3 records, 12 minutes
  auth : 2 records, 13 minutes
  total minutes : 109
```

```
four records, opened
  r1 : timeout, 12 min, note: vendor A
  r2 : timeout, 9 min, note: vendor A
  r3 : parse, 4 min, note: self
  r4 : timeout, 15 min, note: vendor A
```

```
grouping by the note field, which the summary does not carry
  vendor A : 7 records, 84 minutes  (77% of the total)
  self : 5 records, 25 minutes  (22% of the total)
```

```
  notes whose records all share one category : 1 of 2
  at least one note spans several categories, so its grouping is one the
  summary lists separately and cannot recombine
```

```
what each view can answer
  which category costs the most minutes : summary, 84 for timeout
  who to call about it                  : not in the summary
  minutes attributable to one outside party    : 84  (77%)
```

```
how many records have to be opened before the pattern is visible
  records opened before the same note appears twice : 2
  records in the summary : 12
```

```
control - a week where no note repeats
  largest share held by one note : 34%
  here the records hold nothing the summary is hiding
```

The summary is accurate and complete over the columns it has. Which columns it has was decided before anyone knew what this week would contain.

The number that matters is at the bottom: **two records** opened before the pattern repeats.

Verify it yourself:

```bash
pnpm eml run examples/nobody-opened-a-single-one/nobody_opened_a_single_one.eml
```
