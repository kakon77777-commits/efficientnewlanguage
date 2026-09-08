# The accuracy was measured where the model was confident

`the_accuracy_was_measured_where_the_model_was_confident.eml` - The classifier abstains below a confidence threshold rather than guessing, and on what it does answer it is right 99.4 percent of the time. What that rate is over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The abstain option is the honest design and it was argued for. A classifier forced to answer every case produces its worst output exactly where it knows least, and here those cases go to a person instead. The threshold was chosen from a calibration curve rather than picked, the abstention is logged, and the measured accuracy on answered cases is genuinely 99.4 percent.

Accuracy is computed over ANSWERED cases. Abstaining removes a case from the denominator, and the cases it removes are selected for being the ones the model finds hard.

Thirty-one percent of cases are abstained.

```
accuracy on answered cases      : 9940 per ten thousand
  error rate on those           : 60 per ten thousand
```

```
cases per month                 : 240000
  answered, percent             : 69
  answered                      : 165600
  abstained, percent            : 31
  abstained                     : 74400
```

```
wrong answers per month         : 993
reviewers the abstained go to   : 1
metrics on accuracy over ALL cases : 0
alerts when the abstain rate rises : 0
```

```
the design
  a classifier forced to answer everything : produces its
    worst output where it knows least
  what this one does instead : declines
  where the threshold came from : a calibration curve,
    not a round number
  is the abstention logged : yes
  measured accuracy on what it answers : 9940
    per ten thousand
  verdict : HONEST WHERE IT ANSWERS
```

```
  declining rather than guessing is the right call and the
  measured rate on the answered cases is real
```

```
the denominator
  what accuracy is computed over : answered cases
  what abstaining does to a case : removes it from that
    set
  which cases are abstained : the ones the model finds
    hard, by construction
  so the removed cases are : selected against the metric,
    not sampled from it
  cases removed per month : 74400
```

```
  the rate is correct about the set it ranges over, and
  the set is chosen by the thing being measured
```

```
how to make the number better
  train a better model : works, slowly
  raise the abstain threshold : works, immediately
  what the second does to the answered set : removes the
    hardest remaining cases
  what it does to the reported accuracy : raises it
  what it does to the work : moves it to the reviewer
  metrics that separate the two : 0
```

```
the other side of the threshold
  cases arriving at a person : 74400 a month
  reviewers : 1
  is the reviewer's accuracy measured : it is not in this
    report
  what happens if the abstain rate doubles : the reported
    accuracy improves
  alerts on that : 0
```

```
null control - the denominator is every case
  accuracy on answered cases : 9940, unchanged
  metrics over all cases : 1
  denominator of the headline rate : 240000
  alerts when the abstain rate rises : 1
  the model did not change; the rate stopped being
  improvable by answering fewer questions
```

```
what a measured accuracy guarantees
  the answers it gave were right this often : exactly,
    and the abstain option is the honest design
  the system is right this often : not addressed; the
    denominator is chosen by the model, and it chooses
    against the cases that would lower it
```

```
a rate whose denominator the subject controls is a rate the
subject can improve without improving; declining to answer
is the right behaviour and it is also the cheapest way to
raise the number
```

The abstain option is the honest design - the threshold from a calibration curve, the abstention logged, and 9940 per ten thousand accuracy on what it answers, which is real. Accuracy is computed over answered cases and 31 percent are abstained, so 74400 of 240000 cases a month leave the denominator selected for being hard, watched by 0 metrics over the whole population.

Verify it yourself:

```bash
pnpm eml run examples/the-accuracy-was-measured-where-the-model-was-confident/the_accuracy_was_measured_where_the_model_was_confident.eml
```
