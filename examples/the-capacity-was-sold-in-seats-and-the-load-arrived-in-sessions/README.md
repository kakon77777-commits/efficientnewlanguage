# The capacity was sold in seats and the load arrived in sessions

`the_capacity_was_sold_in_seats_and_the_load_arrived_in_sessions.eml` - Capacity is planned from seats sold, the model was fitted against two years of measured load, and it has predicted the last six months within four percent. What a seat is a proxy for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The planning model is properly built. It is not a spreadsheet of guesses: it was fitted against two years of measured load rather than assumed to be linear, it carries an explicit error bar, it is re-fitted quarterly against what actually happened, and over the last six months it predicted peak load within four percent. Capacity has been bought on it twice and both purchases were the right size.

The input is SEATS SOLD. A seat is a person with a licence, and load arrives as concurrent sessions, which is people times devices times tabs.

The mean seat opened 1.0 sessions two years ago and opens 2.7 now.

```
seats sold                      : 41000
prediction error, percent       : 4
years the model was fitted over : 2
capacity purchases made on it   : 2
```

```
sessions per seat then, tenths  : 10
sessions per seat now, tenths   : 27
  as a percent of then          : 270
```

```
sessions at the fitted rate     : 41000
sessions now                    : 110700
  added with no change in seats : 69700
inputs measured in sessions     : 0
alerts on sessions per seat     : 0
```

```
the capacity model
  fitted against : 2 years of measured load, not assumed
    to be linear
  carries an error bar : yes, explicit
  re-fitted : quarterly, against what happened
  prediction error over six months : 4 percent
  capacity purchases made on it : 2, both right-sized
  verdict : ACCURATE
```

```
  re-fitting quarterly against outcomes rather than
  defending the original curve is the discipline that
  makes this model trustworthy, and it is followed
```

```
the model's variable
  what it takes : seats sold
  what a seat is : a person with a licence
  what load is : concurrent sessions
  what relates them : people times devices times tabs
  is that ratio in the model : as a fitted constant
  inputs measured in sessions : 
    0
```

```
  the model is accurate about the quantity it was fitted
  on and the conversion to the quantity that costs money
  is a constant somebody measured once
```

```
the coefficient
  sessions per seat when fitted : 10 tenths
  sessions per seat now         : 27 tenths
  what changed : a phone client shipped and people leave
    a tab open at home
  did anyone edit the model : no
  did the quarterly re-fit absorb it : yes, which is why
    the predictions stayed good
  alerts on the coefficient itself : 
    0
```

```
what the four percent means
  what the model predicts : load, from seats
  is that prediction good : yes, within 4 percent
  what makes it good : quarterly re-fitting
  what re-fitting does : moves the coefficient after the
    load has already arrived
  so the model is : accurate about the past quarter
  what a sales forecast in seats implies about next year :
    a number computed with today's coefficient
```

```
null control - sessions are an input, not a constant
  prediction error : 4 percent, unchanged
  inputs measured in sessions : 
    1
  alerts on sessions per seat : 1
  the model did not get more accurate; the quantity that
  had been moving under it became a thing with a trend
```

```
what an accurate capacity model guarantees
  load can be predicted from seats, today : exactly,
    within 4 percent, re-fitted quarterly
  seats predict load : not addressed; the model converts
    between two units by a coefficient it does not
    measure, and re-fitting hides that the coefficient is
    what moved
```

```
a model stated in one unit and paid for in another is only
as stable as the conversion between them; re-fitting keeps
the predictions right and removes the evidence that the
relationship changed, which is the thing a plan is about
```

The model was fitted against 2 years of measured load, carries an error bar, is re-fitted quarterly, and predicted six months within 4 percent across 2 right-sized purchases. Its input is seats and the load is sessions, and a seat went from 10 to 27 tenths of a session - 270 percent - so 41000 seats now carry 69700 more sessions under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-capacity-was-sold-in-seats-and-the-load-arrived-in-sessions/the_capacity_was_sold_in_seats_and_the_load_arrived_in_sessions.eml
```
