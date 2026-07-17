# Reverse Python→EML transpiler — how it was built (Phase 8 retrospective)

**Status:** COMPLETE (2026-07-16 to 2026-07-17). Every Phase 0–7 EML construct that CAN round-trip
now does. This document is a retrospective, not a spec — `docs/EML-LANG-2026-v1.0.md` §9/§11 is the
normative source of truth for what round-trips. This exists so the *methodology* is reusable the next
time a similar reverse-engineering problem shows up (the most likely candidate being a real
`C⁺⁺⁺ → C++` reverse direction — see the closing section and `docs/cpp-feasibility.md`).

## What triggered this

A real B-6 corpus-validation measurement (5 unmodified, real-world Python files) ran `eml compress`
and got 5/5 failures, almost all within the first few lines. Root cause: the reverse Python→EML
lexer/parser had never been extended past Phase 0–5's flat statement mappings — it had **zero**
support for `if`/`while`/`for`/`def`/`class`/`try`, the exact constructs almost any real Python file
uses immediately. This had been a known, documented scope cut, but nobody had measured its real-world
severity until real files were actually thrown at it.

## What shipped, phase by phase

| Phase | Date | What round-trips now | Size |
|---|---|---|---|
| A | 07-16 | `if`/`elif`/`else`, `while`, `for...in` + shared INDENT/DEDENT lexer/parser infra | large (new tokenizer algorithm) |
| B1 | 07-16 | `break`/`continue` | small |
| B2 | 07-16 | dict/set literals + subscript, `AssignTarget` widened to `Identifier \| Subscript` | medium |
| C | 07-16 | attribute access (incl. as call callee) + bare `import module`, `AssignTarget` → `+ Attribute` | medium |
| D | 07-16 | `try`/`except`/`finally` + `raise` | medium |
| E1 | 07-16 | function definitions + `return` (`@cold`/neutral subset) | medium (new `AT` token) |
| E2 | 07-17 | `class` (minimal viable OOP) | **smallest phase of the series** |

Each phase mirrors forward's OWN phase numbering (Phase 6 → 7a → 7b → 7c → 7d → 7e → 2 → 7e) — the
reverse direction was built as a deliberate, separate pass over the same construct list, not
alongside forward's original implementation. 637 tests at completion (up from 565 before Phase A).

## The methodology that generalizes (the actual point of this document)

If you're about to tackle a similar reverse-engineering problem — recovering a structured
representation from generated/real-world output of some target language — this is the discipline
that made 7 phases land cleanly with no rework:

1. **Read the forward emitter's actual source before writing a line of reverse code.** Every phase
   started by reading the exact forward emission logic for the construct in question, not assuming
   from memory. This caught real, non-obvious asymmetries that would have been invisible from the
   AST alone — e.g. Phase E1's discovery that `@cold` emits a real decorator but `@hot` emits only a
   *comment* (unrecoverable, since comments are never tokenized by the reverse lexer). If the
   forward and reverse sides are maintained by different sessions/people/AI runs, this step is not
   optional — assumptions rot fast.
2. **Verify a suspected bug by actually running it before fixing it.** Every "real bug found" in this
   effort (the `break`/`continue`/`pass` silent-mistranslation vulnerability, the reassignment-of-a-
   bound-name sigil bug) was confirmed via a direct failing test BEFORE any fix was written. Assumed
   bugs that turn out not to reproduce waste a fix on a non-problem; verified bugs come with a
   regression test for free.
3. **Distinguish PERMANENT information loss from a DEFERRED gap, explicitly, in the docs.** `class`
   was deferred (just not built yet) and is now done. `@hot` is permanent (the forward side throws
   away the only marker that would let the reverse side recover it) and never will round-trip no
   matter how much more reverse-parser work happens. Conflating these two categories in documentation
   sets a wrong expectation for future work — don't file a permanent gap as a TODO.
4. **Corpus-validate against real, unmodified third-party files after EVERY phase, and report null
   results honestly.** The same 5 real Python files (MIT-licensed, from an external repo) were re-run
   through `eml compress` after every single phase — including phases where the result was "no
   visible change" (Phase C: none of the 5 files' first blocker was attribute/import, so nothing
   moved — reported as such, not glossed over). This is the only way to tell "the reverse parser
   grew" from "the reverse parser grew, but not in a direction any real file benefits from yet."
   Synthetic fixtures alone would never have surfaced the multi-line-bracketed-literal boundary or the
   real `Duplicate_files_remover` progression from `def hashFile` → `with open(...) as file`.
5. **A recurring, specific bug class: bare keywords immediately followed by end-of-line.** `break`,
   `continue`, and `pass` each independently turned out to be silently mistranslatable into a harmless
   bare-identifier reference, because — unlike every OTHER still-unsupported keyword — nothing
   naturally follows them on the same line to trip a syntax error. Any future reverse-parser
   extension that adds a new zero-argument statement keyword should check for this specific failure
   mode explicitly; it will not fail loudly on its own.
6. **Scope-isolation direction is construct-specific — derive it from the FORWARD semantic analyzer,
   don't invent a new rule.** Four distinct rules emerged, each mirroring what the forward semantic
   analyzer already does for that construct: branch-merge-if-exhaustive (`if`/`elif`/`else`),
   shared-live-scope (`while`/`for`, since 0+ iterations aren't mutually exclusive branches),
   isolated-per-part-never-merges (`try`/`except`, since which part ran is conditional), and
   fresh-scope-isolated-in-BOTH-directions (`def`/`class`, the only constructs that are real call
   boundaries — nothing leaks in OR out). Getting this wrong in either direction produces silently
   wrong EML that LOOKS plausible.
7. **Auto-synthesized boilerplate needs an explicit skip, not a literal round-trip.** The forward
   side sometimes emits things the user never wrote (`import functools`, added automatically whenever
   a `@cold` function exists). Reconstructing these literally in the reverse direction duplicates them
   on the next forward pass. Any reverse effort needs to identify which parts of the target output are
   genuinely user-authored vs. synthesized, and specifically drop the latter.
8. **A "fails" isn't always a thrown error — verify the actual failure mode.** Phase E2 corrected a
   Phase E1 claim: `@hot`'s round-trip loss doesn't throw a reverse-parse error, it silently succeeds
   and produces a **mismatch** at the final comparison step (`python1 != python2`). This distinction
   only surfaced because a test asserted the wrong error string and failed — a useful reminder that
   "doesn't round-trip" can mean several different concrete failure shapes, and only one of them is
   directly observable without deliberately probing for it.

## What's still NOT round-trippable (and why none of it is a reverse-parser gap)

- `@temporal_loop` / `async`/`await` — permanently forward-only (async has no synchronous EML
  equivalent at all).
- `@hot` — permanently forward-only within function support (comment-only emission, see point 3/8
  above).
- Everything else Phase 0–7 defines now round-trips.

Separately — and this is NOT part of the "reverse transpiler is done" claim — the 5 real corpus files
from B-6 still don't fully round-trip, because they use Python features **EML itself doesn't have on
either side yet**: `%` string formatting, the `or` boolean operator, `with`/context managers, and
multi-line bracketed literals. Closing these is a language-design decision (forward AND reverse), not
reverse-engineering work, and is explicitly out of this document's and this effort's scope.

## If this methodology is applied to a real C⁺⁺⁺ reverse direction

`docs/cpp-feasibility.md` already scopes this out in detail (see its "Clang/LibTooling feasibility"
section) and recommends the right first step: a small LibTooling spike that round-trips exactly ONE
pattern (accumulation loop ↔ `Σ`) before committing further. What transfers directly from this
effort, and what doesn't:

**Transfers directly:**
- The phased, construct-by-construct rollout (don't attempt "full C++ reverse" as one project —
  ship the smallest useful slice, test it, corpus-validate it, document it, repeat).
- The corpus-validation discipline itself — find real, unmodified C++ files and honestly report
  round-trip progress/regressions after each slice, exactly as done here.
- The permanent-vs-deferred gap distinction, and documenting it explicitly as work proceeds (C++ will
  have its own permanent losses — comments, macro expansion, template instantiation details — that
  need identifying up front, the way `@hot` was here).
- The scope-isolation-by-construct principle (a C++ function/class body is also a call/scope
  boundary; the same four-way taxonomy from point 6 above likely still applies).

**Does NOT transfer:**
- The hand-rolled recursive-descent lexer/parser approach. Python's reverse side could be built from
  scratch in ~7 small phases because the target subset is narrow and self-defined. Real C++ requires
  an actual C++ parser (Clang/LibTooling) — there is no shortcut equivalent to "just add a few token
  types and a parseBlock() call." This is the core reason `docs/cpp-feasibility.md` treats the C++
  reverse direction as a much bigger, separate undertaking, not a continuation of this one.
- The "bare keyword + EOL" bug class doesn't directly apply (C++ has no Python-style
  significant-whitespace ambiguity), but analogous "silently valid but wrong" parse classes will exist
  and need their own discovery process via real test cases, not assumption.
