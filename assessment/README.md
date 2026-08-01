# EML-P assessment

An honest account of what EML-P is good at, what it is not, how many real
defects it has had, how each was found and fixed, and what it would take to
improve it — calibrated to **the team that will actually do the work**, not to
a hypothetical one.

Written 2026-08-01. Every number here was measured from the repository on that
date, not recalled. Where a figure could not be measured it says so.

| | |
|---|---|
| [01 — Strengths and weaknesses](01-strengths-and-weaknesses.md) | what EML-P does well, what it does badly, and what it simply does not do |
| [02 — Defect log](02-defect-log.md) | every real defect found since the corpus discipline began, what it was, how it was found, how it was fixed |
| [03 — Improvement backlog](03-improvement-backlog.md) | what to fix next, with time estimates calibrated to this team |
| [04 — The method](04-method.md) | the measurement-axis discipline — the most transferable thing this project produced |
| [05 — Designer capability](05-designer-capability.md) | who builds this, what that makes cheap, what it makes expensive, and which defect classes it structurally invites |

## The shape of it, in one page

EML-P is a **practical execution profile**: a compact symbolic surface syntax
that transpiles to Python, back from Python, and — separately — executes in its
own interpreter so that a trace can exist in a browser with no Python runtime.

Measured on 2026-08-01:

| | |
|---|---|
| source | 12,706 lines of TypeScript across 15 packages |
| tests | 8,354 lines, 51 files, **1,530 tests**, all passing |
| case corpus | **194 self-authored EML programs**, 11,561 lines |
| docs | 16,353 lines |
| repository age | 2026-06-25 → 2026-08-01 (**38 days**, 37 commits) |
| known open defects | **0** — with the honest caveat below |

**The caveat matters more than the zero.** "No known defects" means nothing
this project knows how to ask is currently failing. Six times now, building a
measurement the project did not previously have has immediately found real
divergences from CPython that every existing gate had passed. The number of
open defects is therefore best read as a statement about the questions being
asked, not about the code.

The single most important thing in this folder is
[04 — The method](04-method.md), because it is the part that survives being
right or wrong about any particular defect.
