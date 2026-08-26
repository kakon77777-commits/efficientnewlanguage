# The alert threshold was set from the week it was written

`the_alert_threshold_was_set_from_the_week_it_was_written.eml` - An alert fires when requests per second cross 2400. That number was chosen in month 0 as twice the busiest second of the week the alert was written. What it means in each later month is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Twice the observed peak is a good rule and was chosen with care. It is not a guess: it comes from a real week of real traffic. It leaves genuine headroom rather than tripping on ordinary variation. It is a single number an on-call engineer can hold in their head. And it was written down with the reasoning attached, which is more than most thresholds get.

The reasoning is a ratio. The threshold is a constant. Traffic compounds at about 4 percent a month, which nobody would call growth worth mentioning, and a constant does not compound. The gap closes on its own, with no decision, no deploy, and no line in any changelog.

What makes this expensive is not the crossing. It is that the alert keeps working perfectly the whole way: it fires exactly when the rule says, and the rule stopped meaning what it was written to mean.

```
month 0 peak: 1200 rps
threshold set to twice that: 2400 rps
traffic compounds at 4 percent per month
```

```
month   daily peak   threshold   headroom   alerts that month
  6        1515         2400        885        0
  12        1914         2400        486        0
  18        2419         2400        -19        30
  24        3057         2400        -657        30
  30        3866         2400        -1466        30
  36        4888         2400        -2488        30
```

```
  the threshold was first exceeded by ordinary traffic in month 18
  false alerts since then: 570
  nothing was deployed in month 18 and nothing broke
```

```
month 36
  ordinary daily peak : 4888 rps -> alert fires
  a real incident     : 14664 rps -> alert fires
  the two are 9776 rps apart and produce the same page
```

```
  the alert is not broken; it fires exactly when the rule says
  the rule is 'above 2400', and above 2400 is now where the service lives
```

```
the threshold, expressed as the multiple it was written to be
  month 0: threshold is 200 hundredths of the current peak
  month 6: threshold is 158 hundredths of the current peak
  month 12: threshold is 125 hundredths of the current peak
  month 18: threshold is 99 hundredths of the current peak
  month 24: threshold is 78 hundredths of the current peak
  month 30: threshold is 62 hundredths of the current peak
  month 36: threshold is 49 hundredths of the current peak
  it was written to be 200 hundredths and was never changed
```

```
control - the identical rule written as a ratio against LAST month's peak
  it must do two separate things: stay quiet on growth, and still fire on a spike
  month 12: peak 1914, threshold 3682, a 3x spike would be 5742
  month 24: peak 3057, threshold 5880, a 3x spike would be 9171
  month 36: peak 4888, threshold 9400, a 3x spike would be 14664
  rejection side: false alerts from ordinary growth over 36 months: 0
  acceptance side: 3x spikes detected: 36 of 36
  constant threshold, false alerts over the same 36 months: 570
  a threshold that only ever stayed quiet would pass the first test and fail the second
```

```
  same intent, same data, same week; one of them decays and one does not
```

```
null control - the same constant threshold against flat traffic
  peak after 36 months : 1200 rps
  false alerts         : 0
  the threshold is the same age and is still correct
  so the defect is not 'old threshold', it is 'constant compared against a
  quantity that compounds'
```

```
how a written-down number ages
  an absolute number       decays at the rate the world grows
  a ratio to a live value  does not decay
  a ratio to a frozen value decays exactly like an absolute number
  the reasoning was a ratio and only the result was stored
```

Twice the observed peak was a defensible rule, taken from real traffic, with the reasoning written down beside it. The reasoning was a ratio and what got stored was 2400. Ordinary traffic passed it in month 18, and by month 36 the page for a normal Tuesday and the page for a 14664 rps incident are the same page. 570 alerts fired, every one of them obeying the rule exactly.

Verify it yourself:

```bash
pnpm eml run examples/the-alert-threshold-was-set-from-the-week-it-was-written/the_alert_threshold_was_set_from_the_week_it_was_written.eml
```
