# Improvement backlog

What to fix, in order, with time estimates **calibrated to the team that
actually does the work**: one person plus an AI pair, roughly one working
session per day (measured: 37 commits over 38 days), no second reviewer,
Windows host with Linux CI.

Estimates are given in **sessions, not hours**, because a session is the unit
this work is actually done in — a two-hour task that does not fit in the
session remaining takes a whole day. An estimate calibrated to a team that does
not exist is worse than no estimate.

"Done" means **gated**, not written. A change with no measurement that would
catch its regression is not finished.

For what each item unlocks in terms of usable capability, see
[05 — Capability and fit](05-capability-and-fit.md).

---

## Tier 1 — real gaps, each fits in one session

### 1.1 Add `//` floor division

**Why.** Measured today: EML-P has no `//`, and `int(a / b)` routes through a
64-bit float, so exact integer division of large values is unreachable by any
single operator. For `123456789012345678901234567890 / 7` the float route
agrees with the true answer for exactly 16 digits and then diverges for 13
more. `examples/long-division-exact` implements it by hand and documents the
gap; that case should become a demonstration of a language feature rather than
a workaround for its absence.

**Cost.** ~1 session. The shape is known exactly — `%` was added the same way,
and today's `pass` addition traced the full 15-file path again. Floor division
is harder than `pass` only in that it needs CPython's toward-negative-infinity
rounding, which the operator matrix will pin immediately.

**Gate.** The existing operator matrix picks it up for free once the operand
table includes it; add the negative-operand rows explicitly.

### 1.2 Warn on calls to names that are neither defined nor builtin

**Why.** `type(e).__name__` transpiles to Python that runs and an interpreter
`NameError`. `eml check` passes. The checker already knows the ten builtins and
every function the program defines, so a call to anything else is either a typo
or an out-of-profile builtin — both worth saying at check time rather than at
run time.

**Cost.** ~1 session, most of it spent on false positives around imported
module attributes.

**Risk.** This is the item most likely to be annoying if done carelessly. Ship
it as a warning, never an error.

### 1.3 Sweep `@cold` cache-key behaviour across argument types

**Why.** The one candidate axis from the backlog that has **never been
measured**. `@cold` memoisation is keyed by `repr(args)`; which argument types
collide, and which fail to collide when they should, is unknown. Every previous
axis found something on its first run.

**Cost.** ~1 session, on the pattern of the five sweeps that already exist.

### 1.4 Exception hierarchy in the interpreter

**Why.** `except ArithmeticError:` does not catch `ZeroDivisionError` in the
interpreter, though it does in the transpiled Python. This is a known,
documented fidelity gap from Phase 7d and it is a genuine divergence between the
two implementations of the same program.

**Cost.** ~1 session. A parent table for the builtin exceptions plus
`matchesHandler` walking it.

---

## Tier 2 — needs more than a session, or a decision first

### 2.1 A performance gate

**Why.** Nothing measures speed or memory. Today an O(n³) corpus program
produced a **229 MB** trace and was caught by a test timeout — the right
outcome by accident. A trace-size ceiling per case and a wall-clock budget for
the suite would make it deliberate.

**Cost.** ~1 session for a size/time ceiling; **several** for anything
resembling real benchmarking.

**Recommendation.** Do the cheap half now, in the same session as anything
else. It is three assertions.

### 2.2 Generate corpus programs from the grammar

**Why.** The corpus is written by the same person who writes the implementation
and inherits their habits. Zero of 179 programs used `pass`; zero used a
class-level attribute; both were broken. A generator that emits syntactically
valid programs from the grammar and diffs them against CPython would find the
next `pass` without anyone having to think of it.

**Cost.** ~2–3 sessions. This is the highest-leverage item in the whole backlog
and the one most likely to be deferred, because nothing is visibly broken today.

### 2.3 Decide what the C++ prototype is for

**Why.** 447 lines that reject `if`, `while`, `for`, `try`, `class`, `with`,
`break`, `continue`, `pass` and `import`. It handles straight-line arithmetic.
Presenting it as a second host is not currently honest.

**Cost.** Not estimable — it is a **decision**, not a task. Either commit
several sessions to make it a real target, or relabel it a feasibility sketch.
Relabelling costs one hour and is the honest default.

### 2.4 Windows-vs-Linux encoding CI

**Why.** CI is Linux; the machine is Windows with cp950. Defects invisible to
green CI have shipped. Today's harness reported 23 false divergences from
newline handling alone.

**Cost.** ~1 session to add a Windows matrix job; **more** to make the whole
suite pass on both without special-casing.

---

## Tier 3 — worth stating, not worth doing yet

- **List `.append`.** `xs + [item] => xs` is O(n) per append, which is why one
  corpus program was accidentally O(n³). A real append changes the value model
  from copy-on-write to mutation and touches everything. ~3+ sessions and a
  design decision, not a fix.
- **More builtins.** `sorted`, `enumerate`, `zip`, `range` as a value. Each is
  cheap alone (~half a session with a shape sweep); the question is whether
  EML-P wants a bigger surface, which is Neo's to answer, not a defect.
- **A second reference implementation.** The interpreter is checked against
  CPython. Nothing checks the *transpiler's* Python against a second reading of
  the same EML. Interesting, expensive, and not currently blocking anything.

---

## What NOT to do

**Do not chase the open-defect count to zero and stop.** It is already zero, and
that number has been zero on the morning of every day a sweep then found
fifteen defects by lunchtime. The count measures the questions being asked.

**Do not add a seventh gate before using the five that exist.** Each of the six
axes was built because the previous one had gone green. That order matters: a
gate built before its predecessor is exhausted finds the same defects twice and
teaches nothing.

**Do not estimate any of this for a larger team.** Every figure above assumes
one person plus an AI pair, one session a day, no second reviewer. If that
changes, re-estimate from scratch rather than dividing — the constraint that
sets these numbers is how much fits in a session, not how many hands there
are.
