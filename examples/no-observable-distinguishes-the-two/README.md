# No observable distinguishes the two — 1800 observations, zero disagreements

`no_observable_distinguishes_the_two.eml` runs an aliasing store and a copying
store side by side and counts how many observations tell them apart.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: one store keeps the list it was handed; the other keeps a
copy. That is a real difference with real consequences. Under the six questions
this program knows how to ask — size, total, largest, membership, an element, a
rendering — every answer agrees:

```
observations that distinguish an aliasing store from a copying store
  inputs 6 x questions 6 = 36 observations
  observations where the two disagree: 0
```

**More effort on the same surface buys nothing:**

```
repeating the original questions many times over the same surface
  observations made: 1800
  disagreements found: 0
```

Fifty times the work, still zero. This is not a weak suite. The difference does
not reach the answers, so no assertion over those answers can ever fail.

**One new KIND of question separates them immediately** — change the caller's
list after handing it over, then ask again:

```
the same two stores, after the caller changes its own list
  observations: 30
  observations where the two disagree: 21

first witness
  input    : [1, 2, 3]
  question : total
  aliasing : 104
  copying  : 6
```

A suite is bounded by what the system **renders**, not by how hard it looks.

**Where this case came from.** On 2026-08-11 the project's own execution-truth
gate — the one every other check leans on — was drilled with exactly this defect
and stayed green, and so did the previous version of that gate. Not a
regression: none of the 330 corpus programs has stdout that depends on list
aliasing. That became [axis 16](../../assessment/04-method.md), which sweeps
mutation operators over the emitted Python and reports which classes of defect
the corpus cannot expose at all. Its first run: the aliasing mutation applies to
12 programs and **0 of them notice**. This file is that measurement written as
a program.

Related, and a different question: [mutation-survival](../mutation-survival/)
asks which of my tests kill which mutants — a question about test strength.
This one asks whether any test *could*, which is a question about the observable
surface, and no amount of test strength moves it.

Verify it yourself:

```bash
pnpm eml run examples/no-observable-distinguishes-the-two/no_observable_distinguishes_the_two.eml
```
