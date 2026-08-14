# Each step is of those who reached it — five 90% steps make 59%, and fixing any one gains the same

`each_step_is_of_those_who_reached_it.eml` computes the end-to-end rate and the
per-step losses from the same five rates, then tries improving each step in turn.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: per-step rates are the right thing to instrument. They
are stable when traffic moves, comparable between steps, and actionable by the
team that owns one step. Every one of them is correct. Two things do not follow
from them, and both are computed here rather than reasoned about.

```
end to end : 590 of 1000 = 59%
lowest per-step rate : 
  90%
  the end-to-end number is below every single step's rate
```

**Which step costs the most people** — every rate is identical on purpose, so
the ranking cannot be read off the rates:

```
people lost at each step
  sign up : 100
  verify email : 90
  add details : 81
  choose plan : 73
  pay : 66
  largest loss : sign up, 100 people
  its rate     : 90%, the same as every other step
```

**And the result that refuses the obvious next move.** "Fix the step that loses
the most people" sounds right, and the arithmetic says position does not matter:

```
raise one step from 90% to 95%
  at sign up : 622 finish (32 more)
  at verify email : 622 finish (32 more)
  at add details : 622 finish (32 more)
  at choose plan : 622 finish (32 more)
  at pay : 623 finish (33 more)
```

The gain is the same wherever it is applied, because the steps multiply and
multiplication commutes. The one-person difference at `pay` is integer rounding,
left visible rather than smoothed away. So the absolute-loss ranking answers
*where the people go*, not *where to spend the week*.

**The control** is a funnel with one genuinely bad step, where the two rankings
do coincide — otherwise the case would read as "rates never tell you anything":

```
control - a funnel where one step really is the problem
  largest loss : verify email, 495 people
  its rate     : 50%, the lowest in the funnel
  here the worst rate and the worst loss are the same step
```

Every per-step rate is a true statement about the people who got there. Neither
the end-to-end rate nor the ranking of steps by cost can be read off them
without doing this arithmetic.

Verify it yourself:

```bash
pnpm eml run examples/each-step-is-of-those-who-reached-it/each_step_is_of_those_who_reached_it.eml
```
