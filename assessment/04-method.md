# The method

The most transferable thing this project produced. It is not specific to EML,
to Python, or to language implementation.

---

## The rule

> When a coverage metric reaches 100%, do not read it as *done*.
> Read it as **"this axis is exhausted — now find the one it cannot see."**

Then build a different measurement and run it. It has fired six times, and
**every single time it found real divergences on the first run**.

---

## The six axes, in the order they were built

| # | axis | result | what it could not see |
|---|---|---|---|
| 1 | syntax constructs used by the corpus | all 26 covered | how many **arguments** a builtin was ever called with |
| 2 | builtin × argument shape | 15 divergences, 5 builtins never called | which operand **types** an operator met |
| 3 | operator × operand type (972 cells) | 15 divergences | that it compared exception **types**, not messages |
| 3b | …the same matrix, comparing **messages** | 273 more cells, 3 families | statement **ordering** |
| 4 | statement-level interaction (33 nestings) | 4 defects | **values** at their boundaries |
| 5 | value-model boundaries (55 values) | 0 — clean first run | the **reverse** direction under nesting |
| 6 | reverse transpilation by construct pair (100 pairs) | 0 — clean first run | `@cold` cache keys (not yet measured) |

Read the right-hand column downward. Each axis was honest, each went green, and
each was blind in a direction that could only be named after building the next
one. That is the shape of the whole discipline.

---

## Five rules that fall out of it

### 1. Ask what the check is constitutionally unable to notice

Not "is coverage high". The useful question is always
**"what could be completely broken while this stays green?"** Answer it out
loud before trusting a green result.

### 2. Cross products beat name lists

Counting *names* is the weakest form of coverage and the most reassuring to
look at. "Which functions are called" hides "with what arguments". "Which
operators are used" hides "on which types" — an operator counts as covered the
moment one program uses it, so `+` looked exhaustively tested while
`tuple + tuple` had never once run.

### 3. Compare the FULL observable behaviour, including error messages

An error message is output. A gate that checks only the exception type is
measuring less than it appears to. Strengthening the operator matrix from types
to messages turned 972 passing cells into 273 failing ones overnight — the
behaviour had not changed; the question had.

And verify wording against the **real** reference implementation, never from
memory. CPython changes messages between versions and adds use-site context
(`cannot use 'tuple' as a dict key (unhashable type: 'list')`).

### 4. When a sweep finds N failures, look for the structural cause

Fifteen divergences traced to **one** thing: the same "which types are
sequences" set hand-written in five separate places. Correcting five lists
would have been the wrong fix. Making one *derive* from another — so they
cannot disagree — was the right one, and it is why the sixth copy was never
written.

### 5. Drill every gate before trusting it

A check that has never been seen to fail is a claim, not a check. Every gate
added on 2026-08-01 was drilled: the fix it guards was deliberately broken, the
gate was confirmed to fail, and the file was restored **byte-identically**.
Three drills, three failures, three clean restores.

The corollary is uncomfortable and important: a differential harness runs
against real state, and drilling one against *live* uncommitted work has
destroyed uncommitted work before. Drill against a copy.

---

## Two failure modes of the method itself

### Believing the harness

The first run of the statement-interaction sweep reported **23 of 32 cases
diverging**. Every one was the harness: `io.open(..., "w")` on Windows rewrites
newlines, so any program printing more than one line "disagreed".

A harness bug and a language bug look identical from the outside. The
difference between "found 23 defects" and "wrote one broken test" was five
minutes of reading the actual diff instead of the summary line.

**Rule:** when a new measurement reports a large number of failures, suspect
the measurement first. Real divergences arrive in ones and twos; harnesses fail
wholesale.

### A gate that is too slow to run

One gate spawned 32 Python subprocesses. It passed in isolation (4.4 s) and
**timed out inside the full suite** — the worst way for a check to fail,
because it is indistinguishable from a real failure and its first-aid is to
delete it. Rebuilt to run every case in one subprocess.

**Rule:** a gate's cost is part of its design. A check nobody can afford to run
is a check nobody runs.

---

## Why this fits a one-person team specifically

The structural weakness of a solo project is that the same person writes the
implementation and the test that guards it, so a gate can only ask questions
its author thought to ask. That is arithmetic, not a character flaw.

This method does not fix that. It does something better: it makes the blind
spot **measurable**. Every time a new axis finds defects the old ones passed,
that count is a direct measurement of how much the previous questions were
missing — and the reference implementation, not the author, is the one
answering.

See [05 — Designer capability](05-designer-capability.md) for the rest of that
argument.
