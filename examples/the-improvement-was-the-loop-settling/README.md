# The improvement was the loop settling

`the_improvement_was_the_loop_settling.eml` - A metric improved for six months after an initiative started. What else predicts that curve is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Crediting the initiative is reasonable. It started in month one, the metric moved from month one, it moved in the intended direction, and it kept moving. That is what a working intervention looks like and there is no sleight of hand in reading it that way.

A control loop that was knocked off its resting point also produces a run of improving months, ending at a level the loop's own parameters fix. The two explanations agree on every month observed and disagree about where it stops.

Both curves are generated and compared to the recorded months.

```
month   observed   what a settling loop predicts
  1       62         62
  2       54         54
  3       48         48
  4       44         44
  5       41         41
  6       39         39
```

```
largest disagreement over the six months : 0
  the two explanations are within 0 on every month recorded,
  so the six months do not choose between them
```

```
what each explanation says about month 12 and month 24
  the loop      : month 12 33, month 24 33
  the initiative, continuing at the last observed rate of 2 a month:
    month 12 27
  they differ by 6 at month 12, which is 18% of the loop's figure
  and the loop's floor is 30, which the other reading has no term for
```

```
the six months before the initiative
  range : 61 to 63, a swing of 2
  flat, so the system was AT a resting point of about 62 and not settling toward one
  that makes the loop reading weaker, and it is the cheapest thing to check
```

```
if the initiative is the cause and it is stopped
  the metric returns toward 62, losing the 23 points gained
if the loop is the cause and the initiative is scaled up
  the metric stops at 30 however much is spent
  and the spend is attributed to the months where the two agree
```

```
control - a metric falling by a constant amount each month
  step : 8 every month
  a settling loop cannot produce a constant step, because its steps
  shrink with the gap; here the six months do choose
```

The initiative started when the metric started moving and the metric moved the intended way. A loop returning to its resting point fits the same six points, and the two readings differ first at the month nobody has yet.

Verify it yourself:

```bash
pnpm eml run examples/the-improvement-was-the-loop-settling/the_improvement_was_the_loop_settling.eml
```
