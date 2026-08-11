# The method

The most transferable thing this project produced. It is not specific to EML,
to Python, or to language implementation.

---

## The rule

> When a coverage metric reaches 100%, do not read it as *done*.
> Read it as **"this axis is exhausted — now find the one it cannot see."**

Then build a different measurement and run it.

The table below is the running record, and the counts live only there — a tally
repeated in prose goes stale the moment another axis lands, which is exactly
the failure this project keeps finding in other people's dashboards. What the
table shows, read downward: the first group of axes found real divergences on
their first run, a long middle stretch came back clean, and the clean stretch
was broken twice more after everyone had stopped expecting it. Both outcomes
are results. The shift between them is the most useful thing here — a clean
axis is not evidence that the work is finished, it is evidence that *that* axis
is finished.

---

## The sixteen axes, in the order they were built

| # | axis | result | what it could not see |
|---|---|---|---|
| 1 | syntax constructs used by the corpus | all 26 covered | how many **arguments** a builtin was ever called with |
| 2 | builtin × argument shape | 15 divergences, 5 builtins never called | which operand **types** an operator met |
| 3 | operator × operand type (972 cells) | 15 divergences | that it compared exception **types**, not messages |
| 3b | …the same matrix, comparing **messages** | 273 more cells, 3 families | statement **ordering** |
| 4 | statement-level interaction (33 nestings) | 4 defects | **values** at their boundaries |
| 5 | value-model boundaries (55 values) | 0 — clean first run | the **reverse** direction under nesting |
| 6 | reverse transpilation by construct pair (100 pairs) | 0 — clean first run | **slice** bounds and clamping |
| 7 | slice bounds (3 containers × 10 starts × 10 stops) | 0 — clean first run | the compiler's **refusal** surface |
| 8 | diagnostic reachability (23 codes) | 0 unreachable, 0 spurious | what the compiler decides two things ARE |
| 9 | crystallization cache keys (35 variants, every pair) | 0 false cache hits | what the compiler RECORDS, as opposed to what it decides |
| 10 | trace completeness (15 constructs, 12 output shapes) | **2 real defects** | the compiler's SEMANTIC ACCOUNT of a program — purity, importance, loop kind |
| 11 | CTS faithfulness (17 tests) | 0 — clean first run | WHERE a diagnostic says the problem is |
| 12 | diagnostic positions (13 triggers × 3 properties) | **1 real defect** | whether two components AGREE about a fact they each model |
| 13 | rebinding across scopes (8 × 8 positions × 4 value shapes) | **1 real defect** | what the two directions do to a program neither was written for |
| 14 | evaluation order within an expression (44 operand transcripts vs CPython) | 0 — clean first run; **3 grammar boundaries pinned** | whether two names denote the SAME object |
| 15 | aliasing and mutation visibility (31 copy-or-alias behaviours vs CPython) | 0 — clean first run | whether the gate that checks everything else can SEE a given defect at all |
| 16 | what the execution-truth gate can see (8 mutation operators over the emitted Python, run against real CPython) | **1 invisible class named**: list aliasing, 12 programs applicable, **0 detected**; `str`→`repr` detected by only 5 of 40 | *(the next axis has not been named yet)* |

Read the right-hand column downward. Each axis was honest, each went green, and
each was blind in a direction that could only be named after building the next
one. That is the shape of the whole discipline.

### What five clean axes in a row meant, and what ended it

It would be easy to write this table as a success story — *every axis fires,
every axis finds something*. It stopped being true at axis 5, and saying so is
the point. A new axis returning clean means one of three things, and they are
not equally good news:

1. the implementation really is correct along that axis (axes 5–9 look like this);
2. the axis is a re-slice of one already exhausted, so it was never going to
   find anything new;
3. the measurement itself is broken and cannot fail — the failure mode this
   whole document exists to guard against.

Distinguishing (1) from (3) is not optional and is not free. Each of these
gates was **drilled**: the fix it guards was deliberately broken, the gate was
confirmed to fail, and the file was restored byte-identically. A clean axis
that has not been drilled is an untested assertion about an untested assertion.

Axis 9 is the sharpest example of the discipline so far, because the thing it
measures is not an output. `hashFunction` decides whether two `@cold`
functions are "the same logic"; before this file the whole claim rested on two
hand-written pairs, one that must match and one that must not. Two points do
not describe a space. The rule now enforced is the sound direction only —
**two functions that behave differently must never share a cache key** — and
the expected side is computed by RUNNING all 35 variants over a shared battery
of inputs rather than by asserting which pairs differ. The opposite direction
(same behaviour, different key) is counted and reported, not enforced, because
forbidding it would mean deciding program equivalence.

Drilling it dropped the body from the hash: 528 collisions, plus three named
rules. The file was then restored byte-identically and the gate went green.

**Axis 10 ended the streak, and where it looked is the reason.** Every axis
before it checks something the compiler PRODUCES — Python text, diagnostics,
cache keys. Axis 10 checks the RECORD of what happened, which is load-bearing
in a way none of the others are: the committed `.trace.jsonl` goldens, the
`eml:equiv` execution check and the workbench trace panel are all downstream
of it. A trace that silently under-records is the worst possible failure,
because a golden missing events still matches itself — the check passes
forever and the thing it was checking stopped being observed.

It found two defects on the first run:

- `eml:output` carried `text` and not `end`, so stdout could not be
  reconstructed from the trace. A program using `^0("")` writes one line and
  a trace carrying only `text` claims two.
- A list comprehension executed **invisibly**. `[i for i in [1:1000]] => xs`
  produced the same event census as `[] => xs`, so rewriting a loop as a
  comprehension deleted the work from the record.

Both properties are computed, not asserted: stdout rebuilt from events is
compared against the stdout the same run produced, and a construct's
visibility is measured by diffing two traces rather than by declaring which
events it "should" emit.

The monitor then caught the follow-on: the interpreter changed and none of
its listed conformance tests did, because the new gate was not on its list
for that file. Same shape as the hole found on 2026-08-01, and fixed the same
way — by adding the test, not by accepting the alert.

**Axis 11 checks the compiler's account of a program rather than its output.**
The CTS (Compact Task Summary) states what each function *is* — pure or not,
important or not, what kind of loop it contains — and that summary is consumed
by `eml explain`, by the BUG classifier and by every agent-facing tool. It is
the layer where a wrong answer is most quietly authoritative, because nothing
executes it: the CTS can say a function is pure while the function prints, and
every downstream consumer will repeat the claim.

It ran clean on the first pass. Purity is settled by execution — the test runs
the function and asks whether anything reached stdout — so the expected side is
measured, not typed, which is the only reason a clean result here means
anything.

The monitor had a **third** hole, and it was larger than the first two: the
four files that produce the CTS (`purity.ts`, `importance.ts`,
`loop-classifier.ts`, `cts-generator/src/index.ts`) were absent from its map
entirely, so a change to any of them alerted on nothing. The three holes share
a shape worth naming — every one of them is a file that does not change what a
program COMPUTES. The forward grammar, the trace, and the semantic account are
all *descriptions*, and a description that drifts still runs.

**Axis 12 is axis 8's blind spot, and it took four days to name.** Axis 8
proved every diagnostic code can be triggered; it says nothing about WHERE the
compiler claims the problem is. A diagnostic that fires correctly and points at
line 1 of a 200-line file is reachable, counted, green — and useless, because
the position is the entire value. An editor underlines it, an agent jumps to
it, a human reads the line above. Nothing else in the repo can see a span: the
conformance suites compare output, the goldens compare traces, reachability
compares codes, and a span is none of those.

The defect it found on the first run: **the lex/parse diagnostic carried a
hardcoded byte offset of 0 while its line and column were correct.** One span,
two encodings of one position, pointing at different places — the reported line
said 3 and the offset said the top of the file. `LexError` and `ParseError`
carry only a line and a column, so the offset was never derivable at the throw
site and was left at zero; it is now computed where the text is in scope.

None of the three properties has a typed expected value:

- **self-consistency** — deriving line/column from the offset must reproduce
  the reported pair. Two independent encodings of one fact, so the source text
  IS the oracle and no reference answer exists to get wrong.
- **vertical shift invariance** — prepending k blank lines must move every
  reported line by exactly k and leave the column alone. A hardcoded position
  fails the moment k > 0.
- **trailing invariance** — appending blank lines must move nothing, which
  catches a position measured from the end of the file that shift invariance
  alone would pass.

The first two caught the same defect independently, which is the useful kind of
redundancy: neither was written knowing what the other would find.

**The monitor had a fourth hole, and it breaks the pattern the third one
established.** The transpiler's own entry point — `transpiler-python/src/index.ts`
— was absent from the map entirely. It is not a description: it runs on every
compilation, and its emitter, semantic pass, purity, importance and loop
classifier were all listed while the file that CALLS them was not. So the first
three holes were the ones with a tidy explanation, and this one says something
duller and worse: the map was never audited against the file list. It grew one
entry at a time, as each file happened to come up. **A list maintained by
accretion has holes wherever nothing happened to draw attention** — and the
tidy explanation for the first three was itself a way of not noticing that.

**Axis 13 is the first to compare two components' MODELS of one fact.** The
fact is "which names are already declared here". The forward analyzer keeps a
model of it because `x^+v` is ambiguous — declare when `x` is new, augment when
it is bound. The reverse emitter keeps one because it must decide whether
emitting `x^+v` for a Python `x = v` is safe. The two are maintained in
different packages, by different code, with no shared source, and nothing had
ever diffed them.

They disagreed. The reverse emitter branch-CLONES its set, so a name assigned
in one arm of a non-exhaustive `if` is not treated as bound afterwards; the
forward analyzer keeps it bound. A second `{} => t` after such an `if` therefore
came back as `t += {}` — a TypeError on a dict, from a program that round-tripped
with no diagnostic at all. **80 of 256 pairings** fail when the fix is reverted.

The gate's expected side is a FIXPOINT: transpile forward, reverse, transpile
forward again, and require the two Python renderings to be identical. Nothing is
typed, so the test does not need rewriting when the emitter's formatting changes
— and a test that stated the expected Python would not have caught this at all.

Two things about this defect are worth separating. The comment in the reverse
emitter claimed it mirrored the forward analyzer's rule; it did not, and a
false claim in a comment is exactly what this corpus keeps finding elsewhere.
And the same defect SHAPE had already been fixed twice — once for `for` targets,
once for plain reassignment — with each fix patching the instance. Two sets were
needed, not one: `bound` answers "is this reliably bound" (branch-cloned,
correctly) and `seen` answers "could the forward parser read `^+` as an augment"
(never cloned). One set was being asked two questions.

There is a fourth thing the clean axes mean, and it is about the person
rather than the code. As the implementation converged, the error rate moved.
Across 2026-08-03 to 08-07 the count was six wrong premises, then three, then
five, five, and six — every one written by hand, every one corrected by a
measurement. On 08-06 four of the five shared a shape worth separating out from
the others: the check was looking at **the wrong observable**. A group count
that was stable while the grouping moved; a rendered sequence compared where a
set was meant; an adjacent-pair check where all-pairs was meant; a latency
distribution whose tail was too flat for its own table to show the finding. In
each the quantity measured was real and the question it answered was not the
one asked.
On the day axes 7 and 8 were built, **four separate expectations written by
hand were wrong and the code was right** — a slice bound, a truncation rule,
three diagnostic triggers, and a premise about run-length encoding that the
measurement disproved outright. That ratio is the real signal here: once the
implementation is good enough, the checks become the least reliable part of
the system, and a differential — where the expected side is *computed* rather
than typed — is the only kind that keeps working.

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

**And drilling once is not enough, because falsifiability expires.** The
semantic-drift monitor was drilled when it was built and it failed correctly.
On 2026-08-09 it was drilled again and it did not: an edit to the interpreter's
`assign()` making list binding COPY instead of ALIAS — a change that moves 4 of
31 answers in the aliasing sweep — was reported as *reviewed, no drift*, with
no test touched at all.

Nothing about the monitor's rule had changed. What had changed was the world
around it. The rule excuses a source change when one of its conformance tests
"moved", and it counted a test the baseline had never seen as moved — a
deliberate earlier fix, because writing a whole new conformance file is the
strongest possible response to a semantics change. But "never seen" is read off
the baseline, so a test stays new for as long as the baseline goes unaccepted.
Three conformance files had been added to the mapping since the last accept,
and their absence was excusing *every* subsequent change to two source files,
indefinitely.

The gate was not wrong when it was written and no commit broke it. It decayed,
because the evidence it accepted was evidence about a different change. The two
conditions are now separated: an EDITED test is evidence about this change; a
test the baseline has never seen raises a `STALE BASELINE` alert that names the
files whose drift check cannot currently fail. Re-drilled after the fix: same
edit, `SEMANTICS CHANGED`.

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

This is also why the method suits a project with no second reviewer: it does
not ask anyone to be more careful. It hands the reviewing to CPython, which has
no stake in the answer.
