# A timeout is a fact about the client

`timeout_vs_completion.eml` sweeps a matrix of when the server finishes against how long the client waits, under three client policies.

**What it exercises**: the client gives up; the server finishes anyway.
Both behaved correctly and they now disagree about reality. In all
**10 of 25** cells where the client timed out, the work happened — the
timeout carried no information about the server at all.

The two wrong policies fail in opposite directions and a system usually
picks one by temperament. Blind retry duplicates the work on exactly
those 10 cells and never reports a false failure. Fail-and-stop never
duplicates and reports a failure on exactly those 10 — correct about
itself, wrong about the outcome. Only reconciling gets both right, at
the cost of a second round trip that exists only because the first was
ambiguous.

And the counterintuitive part, measured: a **shorter** timeout makes the
ambiguous region larger, not smaller. Neither broken policy can be
repaired by tuning it, because the timeout is not measuring the thing
the decision needs to know.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
cells where the client timed out: 10/25
in every one of them the work HAPPENED - the timeout carried no information
about the server at all, only about how long the client was willing to wait.

with wait=1, finishes that time out: 4/5
with wait=4, finishes that time out: 1/5
A shorter timeout makes the ambiguous region LARGER, not smaller.

checks passed: 5/5
Retry duplicates, stop lies, and only asking the server gets both right.

The two wrong policies are wrong in opposite directions and a system usually
picks one by temperament rather than by analysis. Retrying trades a false
failure for a duplicate; stopping trades a duplicate for a false failure.
Neither can be repaired by tuning the timeout, because the timeout is not
measuring the thing the decision needs to know.
```
