# The more precise answer wins — precision is printed, accuracy is not

`the_more_precise_answer_wins.eml` puts a four-decimal estimate and a
whole-number estimate against a computed truth.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: one estimator reports four decimal places and discards a
warm-up reading; the other reports whole units and uses everything. When they
disagree, the four-decimal one is believed, and the reason given is never "it is
more accurate" — it is "it is more precise", or more often just the way the two
numbers look side by side.

```
set        precise      coarse       truth
  [20, 14, 15, 16, 14] : 147500  160000  158000
  [8, 30, 31, 29, 30] : 300000  260000  256000
  [50, 41, 40, 39, 41] : 402500  420000  422000
  (all values in ten-thousandths of a unit)

which estimate is closer to the truth
  the four-decimal one : 1 of 6
  the whole-number one : 5 of 6

error, in ten-thousandths
  four-decimal : total 123500, worst 44000
  whole-number : total 16000, worst 4000
```

**The extra precision is real — that is what makes this hard to argue with.**
Bump one reading by the smallest amount a reading can express:

```
  bumps the four-decimal estimate registered : 6 of 6
  bumps the whole-number estimate registered : 0 of 6
  its smallest non-zero move : 2500
  the whole-number estimate did not move at all - rounding absorbed every bump

So the extra resolution is REAL: the four-decimal estimate registers changes
the whole-number one cannot see. It is also worse, by 44000 against 4000
at the worst set, which is more than 2500 - the estimate resolves finely
and points somewhere else.
```

The four-decimal estimate genuinely resolves changes the coarse one cannot see.
It is also wrong by seventeen times its own resolution, because of a warm-up
discard nobody revisits:

```
the effect of discarding the first reading
  sets where discarding it moves the answer : 6 of 6
  largest move                              : 44000
```

All arithmetic is in ten-thousandths of a unit, so the decimals are integers and
nothing depends on floating point. Nothing is declared: both estimators run and
the truth is computed from all the readings.

Precision and accuracy are both real properties and only one of them is printed.

Verify it yourself:

```bash
pnpm eml run examples/the-more-precise-answer-wins/the_more_precise_answer_wins.eml
```
