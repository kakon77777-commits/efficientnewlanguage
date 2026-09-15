# The worst performers improved on their own

`the_worst_performers_improved_on_their_own.eml` - A coaching program was given to the 100 worst-performing stores, and the next quarter they improved. The improvement is real and correctly measured. Whether the coaching caused it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real post-quarter sales, not a forecast; it covers every store that got the coaching; the improvement is the honest after-minus-before; and the intent is exactly 'did coaching lift the worst stores'.

The stores were chosen for being the worst, and an extreme group drifts back toward the average on its own next period; a control of equally-bad untreated stores rose almost as much.

```
stores coached                  : 100
average score before            : 40
average score after             : 58
population average               : 70
```

```
improvement claimed             : 18 points
same-worst stores, no coaching  : 15 points
left for the coaching           : 3 points
regression share of the claim   : 8333 per ten thousand
```

```
the coaching measurement
  reads : the real post-quarter sales, not a forecast
  covers : every one of the coached stores
  improvement : the honest after minus before
  intent : did coaching lift the worst stores
  stores mismeasured : 0
  verdict : THE COACHED STORES ROSE 18 POINTS
```

```
  reading the real after-sales rather than a projection is
  the part done right here, and it is why the 18-point rise
  is a true number about those stores
```

```
picking the extreme, then measuring again
  why they were picked : they were the lowest last
    quarter
  what a low quarter contains : the real level plus a bad
    draw of luck
  what luck does next quarter : it does not repeat, so the
    score rises toward the average
  the untreated equally-bad stores : rose from 40 to 55 on
    their own
  so most of the 18 : would have happened with no coaching
```

```
the credit the program took
  claimed lift : 18 points, all of it
  the control's lift with no coaching : 15 points
  actually attributable to coaching : 3 points
  is the 18 measured wrong : no; the stores really rose 18
  is 18 the effect of coaching : no; 8333 per ten
    thousand of it is regression to the mean
```

```
null control - compare with a same-worst untreated control
  the control rose, with no coaching : 15 points
  effect measured over the control : 3 points
  stores the control isolates the effect for : 100
  no store and no score changed; the 18 stopped being read
  as an effect and started being read against what would
  have happened anyway
```

```
what an after-minus-before on the worst group guarantees
  the chosen stores rose by the measured amount : exactly,
    real sales, every store, honest subtraction
  the coaching caused the rise : not addressed; the stores
    were picked for being extreme, and an extreme group
    regresses toward the mean on its own, so an untreated
    same-worst control rose 15 of the 18 points
```

```
a group selected for being extreme is selected partly for its luck, and luck
does not persist; the next measurement moves toward the average whether or not
anything was done, so the rise of the worst is not the proof that it was fixed
```

It reads the real after-sales over every coached store with an honest before- and-after - the 18-point rise is true. The stores were the worst last quarter, so they regress toward the mean regardless; an untreated same-worst control rose 15, leaving 3 points for the coaching, 8333 per ten thousand of the claim being regression.

Verify it yourself:

```bash
pnpm eml run examples/the-worst-performers-improved-on-their-own/the_worst_performers_improved_on_their_own.eml
```
