# The loop stopped because the steps got small

`the_loop_stopped_because_the_steps_got_small.eml` - The solver stops when a step is smaller than the tolerance. How far it still is from the answer at that moment is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Stopping on the step size is the standard rule and it is the only one available when the answer is not known. It is cheap, it needs nothing but the last two iterates, and on a sequence that is closing fast it stops within the tolerance it was given.

The step is how far the last iteration moved, not how far there is left. On a sequence that closes a fixed fraction of the gap each time, the two are related by that fraction, and a rule that reads one and reports the other is out by a factor nobody chose.

Everything here is in parts per million, as integers, so nothing is hidden in a rounding.

```
target        : 1000000 ppm
each step closes 1 part in 10 of the remaining gap
stop when a step is under 1000 ppm
```

```
the run
  iterations : 45
  last step  : 970 ppm, which is under the tolerance of 1000
  value      : 991268
  distance still to go : 8732
```

```
the rule stopped inside its tolerance on the step and 8732 ppm from
the answer, which is 8 times the tolerance it was given
```

```
the relation between a step and the remainder
  a step of 970 means the gap before it was about 9700
  so after it the gap is about 8730
  measured : 8732
  the step understates the remaining distance by roughly the factor 9
```

```
stopping when the estimated remainder is under the tolerance
  iterations : 66
  value      : 999041
  distance still to go : 959
  it costs 21 more iterations
  and lands 7773 ppm closer
  inside the tolerance that was actually asked for
```

```
what the two tests assert when they pass
  step under tolerance      : the last iteration moved less than 1000
  remainder under tolerance : the answer is within 1000
  only the second one is the thing anybody wanted, and the first one is the
  one that can be computed without knowing the answer
```

```
control - a sequence closing a fixed 5000 ppm each step
  iterations : 200, value : 1000000, remaining : 0
  the remaining distance is under one step, so the step size is a bound
  on it and stopping on the step is stopping on the answer
```

The step size is the only quantity available and the rule that uses it is the standard one. It is a measurement of the last move, and the ratio between that and what is left is sitting in the two iterates already held.

Verify it yourself:

```bash
pnpm eml run examples/the-loop-stopped-because-the-steps-got-small/the_loop_stopped_because_the_steps_got_small.eml
```
