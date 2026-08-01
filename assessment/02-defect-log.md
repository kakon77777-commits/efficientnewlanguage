# Defect log

Every real defect found since the case-corpus discipline began on 2026-07-18,
what it was, **how it was found**, and how it was fixed. A "real defect" here
means the program's observable behaviour differed from CPython's, or the
pipeline accepted something it could not run.

Counts come from commit messages and the code; where a number is approximate it
says so.

---

## Totals

| period | defects | found by |
|---|---|---|
| 2026-07-18 | 1 | writing the first three corpus programs |
| 2026-07-28 | 3 | corpus rounds 16–18 |
| 2026-07-29 | 2 + 1 model gap | corpus rounds 19–21, then a deliberate hunt |
| 2026-07-30 | 15 | builtin-argument-shape sweep |
| 2026-07-31 | 15 + 3 message families | operator × operand-type sweep, then comparing MESSAGES not types |
| 2026-08-01 | 4 | statement-interaction sweep |
| **total** | **≈44** | |

Two facts about that column matter more than the total:

1. **33 of 44 came from four systematic sweeps, not from writing programs.**
   Writing 194 real programs found roughly a quarter of the defects; asking a
   cross-product question found the rest, in an afternoon each.
2. **Every sweep found something on its first run.** Not one of the six
   measurement axes came back empty. That is the strongest available evidence
   that the count is limited by the questions asked.

---

## 2026-07-18 — `True` / `False` / `None` were unbound names

**What.** The interpreter maintained its own scope and had never pre-declared
Python's three keyword literals. A bare `True` raised `NameError` — but only
when it came from a literal, not from a comparison, so most programs worked.

**Found by.** The third corpus program ever written.

**Fixed by.** Pre-binding them in the module scope.
**Time:** minutes.

---

## 2026-07-28 — float summation, and two others (3)

**What.** `sum()` over floats accumulated left-to-right; CPython's `sum()` does
too, but the interpreter's ordering of a Σ-expression did not match, so results
diverged in the last bits.

**Found by.** Corpus round 16, which was deliberately themed on Σ summation.

**Fixed by.** Neumaier compensated summation, plus an honest refusal for the
case that cannot be reproduced (a set of floats — iteration order is unknown).
**Time:** one session.

---

## 2026-07-29 — `%`-formatting, and the exception-object model

**What.** Two `%`-format divergences, then a structural one: exception classes
existed only as **bare names the parser special-cased**, not as values. So
`except ValueError as e` handed back something that could not be compared, and
`__exit__`'s first argument arrived as a *string*.

**Found by.** Corpus rounds 19–21 for the format bugs. The exception-model gap
was found by asking, after the fact, "what else is shaped like this?"

**Fixed by.** Real `EXC_CLASS` values bound in module scope, `raise e`
re-raising an actual value. Then — because this class of gap had now cost two
sessions — a **semantic-drift monitor** (`scripts/semantic-monitor.mjs`) that
alerts when a semantics file changes without its conformance test.
**Time:** one session for the fix, half a session for the monitor.

---

## 2026-07-30 — fifteen divergences, from one question

**What.** Sweeping every builtin against every argument shape it could legally
take found 15 divergences and five builtins that **zero** corpus programs had
ever called. Including: `float("banana")` returned `nan`, because the guard was
`!/nan/i.test(s)` and "ba**nan**a" matches.

**Found by.** A cross-product nobody had built before. The construct-coverage
metric was at 100% the whole time — it could not see how many *arguments* a
builtin was ever called with.

**Fixed by.** Writing Python's real numeric-string grammar instead of leaning
on JavaScript's `Number()`, and introducing one shared `iterableItems()` to
replace four hand-written "which types are sequences" lists.
**Time:** one session for the sweep and all 15 fixes.

---

## 2026-07-31 — fifteen more, plus three message families

**What.** Sweeping 972 (operator, left type, right type) cells found 15
divergences in three clusters — tuple as a sequence, set algebra, hashing and
membership. Then, when the gate was strengthened to compare **error messages**
rather than exception *types*, 273 further cells failed, collapsing into 3
message families.

**Found by.** A different cross-product. The previous axis was green.

**Fixed by.** Tuple concatenation and repetition; set difference and subset
comparison; recursive tuple hashability so `(row, col)` can key a dict; and —
the fix that mattered — making `isHashable` *derive* from `canonicalKey` so the
two cannot disagree.

**The structural finding:** four of five tuple omissions were separate
hand-written copies of the same idea. Correcting five lists would have been the
wrong fix; making one derive from another was the right one.
**Time:** one session.

---

## 2026-08-01 — four, from statement-level interaction

### `pass` had no statement form

**What.** The forward parser read `pass` as an ordinary **Identifier**. The
Python emitter printed that identifier verbatim, which happened to be exactly
the right Python — so the transpiled program ran correctly for nine phases.
The interpreter, which resolves names for real, raised
`NameError: name 'pass' is not defined`.

**The part worth recording:** the *reverse* Python→EML parser had refused
`pass` since Phase D, with a comment naming this exact risk —

> `pass` has the exact same silent-mistranslation vulnerability break/continue
> had before being recognized explicitly

— and the forward side never got the matching guard. The same author saw the
danger in one direction and not the other, on the same afternoon.

**Fixed by.** A real `Pass` statement across AST, lexer, parser, three
emitters, four semantic walkers and the interpreter; the reverse parser now
emits it instead of throwing, which also removed a documented "cannot express".
**Time:** ~40 minutes across 15 files.

### Class-level attributes were silently dropped

**What.** A class body executed only its `def`s. `class C: tag = "x"` bound the
class and threw the assignment away; `self.tag` then raised `AttributeError` as
if the line had never been written.

**Fixed by.** Running the class body once in its own namespace, which becomes
the class dict; instance reads fall back to it; writes to the class rebind live
so un-shadowed instances follow.

**And then the second half was missing.** Reads landed; writes did not. Nothing
failed — the trace recorded `interp deferred: write .target` and simply
produced no equivalence event. An honest deferral is what surfaced it.
**Time:** ~30 minutes, plus 10 for the half that deferral revealed.

### `IndexError` used one message for reads and writes

**What.** CPython says `list index out of range` for `xs[9]` and
`list assignment index out of range` for `xs[9] = 1`. One message served both.
Invisible to anything checking the exception *type*; immediately visible to any
program that logs `str(e)`.
**Time:** ~10 minutes.

### The builtin-set boundary (documented, not fixed)

`type(e).__name__` transpiles to Python that runs and an interpreter
`NameError`, because EML-P defines ten builtins and `type` is not one. Left as
an **asserted** boundary in `tests/statement-interaction.test.ts` so the day it
changes, a test says so.

---

## Defects in the *tooling*, found by drilling it

Not language defects, but worth counting — they are the reason the numbers
above can be trusted.

| what | how found |
|---|---|
| the monitor hashed raw bytes, so any `git checkout` on Windows fired a false alarm | drilling the monitor |
| the monitor alerted on corpus-coverage noise | drilling the monitor |
| a brand-new test file did not satisfy the monitor's drift check | drilling the monitor |
| the forward parser and lexer were **not on the monitor's watch list at all** | today, when a grammar change touched both |
| the monitor's refusal drill depended on the rest of the tree being clean | today, when it wasn't |
| the first run of the statement sweep reported **23 of 32 cases diverging** — every one was `io.open(..., "w")` rewriting newlines on Windows | reading the output instead of believing it |
| one gate passed alone and timed out inside the full suite (32 python subprocesses) | running the full suite |

The 23 false positives are the most instructive entry in this document. A
harness bug and a language bug look identical from the outside, and the
difference between "found 23 defects" and "wrote one broken test" was five
minutes of reading the actual diff.
