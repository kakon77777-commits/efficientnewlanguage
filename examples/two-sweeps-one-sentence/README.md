# Two sweeps, one sentence — 132 of 144 worlds hide behind the same zero

`two_sweeps_one_sentence.eml` runs every one-defect world through both sweeps
and counts which worlds each one can separate from the clean world.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: both sweeps are honest. Neither hides anything, neither
has a bug, and both print exactly what they observed. What differs is the
domain each one walked — and the report has no field for the domain.

```
grid
  cells        : 144
  sweep A walks : 12
  sweep B walks : 144
```

The clean world is the control. Without it a reader cannot tell whether A's
zero is an observation or a broken sweep:

```
world 0 - nothing is wrong
  sweep A : 0 divergences found
  sweep B : 0 divergences found
  the two reports agree, and both are correct
```

**Which worlds to show is not chosen by hand** — the program asks A for the
first world it can see and the first it cannot:

```
world 1 - a wrong cell that A walks over
  sweep A : 1
  sweep B : 1

world 2 - a wrong cell that A does not walk over
  sweep A : 0
  sweep B : 1

A prints the same number in world 0 and world 2.
Those two worlds are not the same world.
```

**The size of the gap is enumerated, not estimated:**

```
one-defect worlds : 144
  A separates from world 0 : 12
  A cannot separate        : 132
  B separates from world 0 : 144
```

**And this is the half that makes the narrow sweep worth running:**

```
restricted to the cells A walks
  worlds in that subdomain : 12
  A finds                  : 12
  over its own domain A is exhaustive - there, zero IS absence
```

Over the cells it actually walks, A finds every planted defect. Its negative
result is a proof *about the diagonal*. The claim it supports is real; it is
narrower than the sentence it printed.

**Related.**
[coverage-through-one-caller-is-not-coverage](../coverage-through-one-caller-is-not-coverage/)
is the same gap seen from the other side — there the domain is fixed by a
caller's input space rather than by a sweep's own choice, and the question is
what "the helper is covered" licenses.

Verify it yourself:

```bash
pnpm eml run examples/two-sweeps-one-sentence/two_sweeps_one_sentence.eml
```
