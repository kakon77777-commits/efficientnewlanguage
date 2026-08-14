# The absence was created by the filter — same loss, one keeps the answer

`the_absence_was_created_by_the_filter.eml` runs two pipelines with comparable
drop rates over the same 40 records and compares each reported rate against the
true one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: dropping records is not the defect. Every pipeline drops
something and the drop is usually harmless — it costs a little precision and
leaves the estimate where it was. The failure needs one extra property: that
whatever is being counted is also what makes a record undroppable.

```
the world
  records produced : 40
  faulty           : 8
  true rate        : 20%
```

**Pipeline A drops for reasons of its own. Pipeline B drops because the fault
truncates the record and the parser discards what it cannot parse:**

```
pipeline A - drops every fourth record, for reasons of its own
  parsed   : 30
  dropped  : 10
  faulty among parsed : 6
  reported rate       : 20%

pipeline B - the fault truncates the record, so the parser discards it
  parsed   : 32
  dropped  : 8
  faulty among parsed : 0
  reported rate       : 0%
```

**A loses more records than B and keeps the answer:**

```
loss
  A dropped : 10
  B dropped : 8
  A reported rate vs truth : 20% vs 20%
  B reported rate vs truth : 0% vs 20%
  A loses records and keeps the answer
  B loses records and loses the answer
```

Pipeline A is the control, and it is the whole point. Without it the reader
concludes "we lose a quarter of our records" and fixes the wrong thing —
A loses *more* and its number is exact.

**What each one threw away:**

```
what each pipeline threw away
  A : 2 faulty, 8 clean
  B : 8 faulty, 0 clean
  B threw away every faulty record and nothing else
```

Both pipelines can truthfully say they drop records. Only one of them is
reporting a number about the world. A count is only as good as the independence
between what got counted and what got kept.

**Related.** [log-sampling-bias](../log-sampling-bias/) keeps every record it
samples and still loses a distribution, because the sampling period aligns with
a period in the data. Here nothing is periodic; the correlation is between the
drop rule and the defect itself.

Verify it yourself:

```bash
pnpm eml run examples/the-absence-was-created-by-the-filter/the_absence_was_created_by_the_filter.eml
```
