# The alert count fell and the thresholds were raised

`the_alert_count_fell_and_the_thresholds_were_raised.eml` - The noise programme cut alerts from four thousand one hundred a week to six hundred and twenty, and every change was reviewed. Which changes they were is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The programme was run properly. Every rule was looked at by the team that owns the service rather than deleted centrally; each change carries a written reason; nothing was silenced, only changed, so there is no hidden mute list; and the count comes from the alerting system rather than from the pager, so alerts nobody was paged for are still in it.

A team asked to reduce its alert count owns the thresholds.

```
alerts a week, before           : 4100
alerts a week, now              : 620
  removed                       : 3480
  remaining                     : 1512 per ten thousand
months of the programme         : 15
```

```
rules in total                  : 640
  threshold raised              : 210
  deleted                       : 90
  logic fixed                   : 34
  touched                       : 334
  left alone                    : 306
  made quieter, of those touched: 6287 per ten thousand
  fixed, of those touched       : 1017 per ten thousand
```

```
incidents a quarter first seen by an alert
  before                        : 47
  now                           : 22
  no longer caught by one       : 25
incidents a quarter first seen by a customer
  before                        : 12
  now                           : 31
  newly caught that way         : 19
```

```
the noise programme
  who reviewed each rule : the team that owns the
    service, not a central sweep
  every change : carries a written reason
  silencing : not used, so there is no hidden mute list
  the count : from the alerting system, so alerts nobody
    was paged for are still in it
  removed a week : 3480
  verdict : QUIETER
```

```
  refusing to silence, so that every reduction is a
  visible change to a rule, is the part almost nobody
  does
```

```
the three ways to reduce a count
  fix the rule so it fires on the right thing : 
    34 rules, 1017 per ten thousand of those
    touched
  raise its threshold : 210 rules
  delete it : 90 rules
  so quieter rather than better : 
    6287 per ten thousand of what was touched
  which of the three is cheapest : the two that need no
    understanding of the failure
```

```
who notices an incident first
  an alert, before : 47 a quarter
  an alert, now : 22
  a customer, before : 12
  a customer, now : 31
  incidents an alert stopped catching : 
    25
  incidents a customer started catching : 
    19
```

```
null control - measure false positives per rule, not volume
  alerts a week at the switch : 
    620, unchanged
  rules whose logic was fixed, before : 
    34
  rules whose logic was fixed, after : 
    196
  no team worked harder; raising a threshold stopped
  counting as an answer
```

```
what a reduced alert count guarantees
  fewer alerts are produced : exactly, 3480 a week,
    every change reviewed by the owning team with a
    written reason, nothing silenced, 15 months
  fewer things go wrong unnoticed : not addressed; the
    quantity asked for was the count, and 
    6287 per ten thousand of the touched rules were
    made quieter rather than righter
```

```
asking a population to reduce a number it controls gets
the number reduced; whether the thing the number stood for
moved is a different measurement, and it is the one that
was not taken
```

Every rule was reviewed by its owning team with a written reason, nothing was silenced, and the count comes from the alerting system - 3480 alerts a week gone in 15 months. Of 334 rules touched, 34 had their logic fixed and 300 were raised or deleted, while incidents first seen by an alert fell 25 a quarter and those first seen by a customer rose 19.

Verify it yourself:

```bash
pnpm eml run examples/the-alert-count-fell-and-the-thresholds-were-raised/the_alert_count_fell_and_the_thresholds_were_raised.eml
```
