# Designer capability, and what it implies

Neo asked for this assessment to **account for the designer's capability**
(考慮設計者能力). Doing that honestly means describing the team as it actually
is, because every estimate in
[03 — Improvement backlog](03-improvement-backlog.md) depends on it, and an
estimate calibrated to a team that does not exist is worse than none.

---

## The team, as measured

| | |
|---|---|
| people | one — Neo (許筌崴), owner and designer |
| assistance | an AI pair, working in daily sessions |
| cadence | measured from git: 37 commits over 38 days, ~1 substantial session per day |
| host | Windows 10, cp950 console |
| CI | GitHub Actions, Linux |
| reviewers | none — no second human reads the diffs |
| domain background | this is a first language implementation, built while learning |

That last line is not a caveat. It is the most important input to every
estimate below, and it cuts both ways.

---

## What this makes cheap

**Mechanical breadth is nearly free.** 194 corpus programs, 1,530 tests, 12,706
lines of source in 38 days is not a normal solo pace. Work that is
well-specified and repetitive — add a construct across 15 files, write 5
verified case programs, sweep a cross-product — costs a fraction of what it
would cost a solo human.

**Systematic sweeps are the natural unit of work.** A 972-cell matrix is as
easy to build here as a 10-case test, which is why six of them exist. Most
one-person projects never build one, because for a human alone the cost is
prohibitive and the payoff is invisible until it fires.

**Rewriting rather than patching is affordable.** When five hand-written copies
of "which types are sequences" were found, deriving one from another was
cheaper than correcting five lists. On a team where refactoring costs
negotiation, the five patches usually win.

**Documentation keeps up.** 16,353 lines of docs alongside 12,706 of source is
unusual, and it is the reason this assessment could be written from measurement
rather than memory.

---

## What this makes expensive

**Anything needing a second opinion.** There is no reviewer. Every design
decision is made once, by whoever is holding it, and shipped. The mitigation is
not "be careful" — it is that CPython plays the role of the reviewer for
semantics, which is exactly why the differential method fits this team so well.

**Anything needing sustained attention across days.** Sessions are the unit.
Work that cannot be finished and verified in one session tends not to get
finished, which is visible in the backlog: the items still open are the ones
that do not fit in a day.

**Anything on a platform not in front of the designer.** CI is Linux; the
machine is Windows with cp950. Encoding defects have shipped that green CI
could not see, and it happened often enough to become a standing rule.

**Performance work.** There is no benchmark suite, and today a 229 MB trace was
caught by a *test timeout*. Nothing in this project currently measures speed or
memory, and building that is a different skill from building correctness gates.

---

## The defect classes this shape structurally invites

This is the part that matters, and it is not about anyone trying harder.

### 1. The same person writes the code and the test that guards it

A gate can only ask questions its author thought to ask. This is not a
character flaw; it is arithmetic. The evidence is precise: **six times**, a new
measurement found real divergences that every existing gate had passed. Each
of those six is a direct measurement of the size of this blind spot.

The countermeasure is the whole point of
[04 — The method](04-method.md): never ask *is coverage high*, ask
**what is this check constitutionally unable to notice**, and then go build
that.

### 2. Asymmetric fixes

Today's `pass` bug is the cleanest example this project has produced. The
reverse parser was given a guard against silent mistranslation, with a comment
naming the danger. The forward parser — same author, same afternoon, same
class of risk — was not. One direction was hardened and the other was not, and
nothing noticed for nine phases.

**Rule this produced:** when a guard is added on one side of a bidirectional
pipeline, check the other side *in the same change*.

### 3. Corpus-shaped blind spots

The strongest gate in the project runs every corpus program through both
implementations. Its power is exactly the corpus — and the corpus is written by
the same person, so it inherits their habits. Zero of 179 programs used `pass`.
Zero used a class-level attribute. Both were broken.

**Rule this produced:** generate test programs from a *grammar or cross-product*,
not only from what someone thought to write.

### 4. Believing the harness

The first run of today's statement sweep reported 23 of 32 cases diverging. All
23 were Windows newline handling in the test harness. It would have been very
easy — and, for a solo builder wanting a productive day, tempting — to start
"fixing" the interpreter.

**Rule this produced:** when a new measurement reports a large number of
failures, suspect the measurement first. Real divergences arrive in ones and
twos; harnesses fail wholesale.

---

## What this implies for the estimates

Every figure in the backlog is given in **sessions** rather than hours, because
a session is the unit this team actually works in, and a two-hour task that
does not fit in the remaining session takes a whole day.

The estimates assume:

- one person plus an AI pair, one session per day
- no second reviewer, so anything requiring consensus is not estimated
- mechanical breadth is cheap; novel design is not
- "done" means gated, not written — a change without a measurement that would
  catch its regression is not counted as finished

They do **not** assume a larger team, a longer runway, or that any of this
becomes someone's full-time job. If any of those change, the backlog should be
re-estimated from scratch rather than divided.
