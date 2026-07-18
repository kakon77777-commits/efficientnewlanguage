# Case corpus: a self-authored class-based todo-list manager

`todo_list_manager.eml` is the third case in a self-authored batch (see
[`examples/unit-temperature-converter/`](../unit-temperature-converter/)
and [`examples/word-frequency-counter/`](../word-frequency-counter/) for the
other two) — part of growing the EML case corpus toward AI-native training
scale, not a port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `class` + `self` attribute state initialized to list
literals (Phase 7e), list concatenation via `+` on `self` attributes (no
`.append()` builtin — not modeled by the interpreter), nested subscript
reads/writes through an attribute (`self.done[index]`, Phase 7b/7c), and a
`for` loop whose range upper bound is a full expression
(`[0 : len(self.tasks) - 1]`, a call plus arithmetic, not a bare identifier).

**A real bug found and fixed while authoring this case**: writing `True`/
`False` as bare literals (`True => self.done[index]`, `[False]`) threw
`NameError: name 'False' is not defined` from the interpreter — `eml run`
(which shells out to real Python) masked it, but `eml trace --run` (which
executes via `@eml/interp`, the browser-safe interpreter) caught it
immediately. Root cause: `True`/`False`/`None` lex as plain identifiers (EML
never reserves them, and the emitter passes them through unchanged since
real Python already binds them) — but the interpreter's own scope never
pre-declared these three names, so any DIRECT literal reference (as opposed
to one produced by a comparison or `and`/`or`) threw a NameError. No
existing example before this one had ever written a bare `True`/`False`/
`None` literal, so the gap went undetected until this case surfaced it —
fixed in `packages/interp/src/index.ts` by seeding the root scope with all
three names, verified against the full test suite (843/843 unrelated tests
unaffected).

Verify it yourself:

```bash
pnpm eml transpile examples/todo-list-manager/todo_list_manager.eml   # -> Python
pnpm eml run examples/todo-list-manager/todo_list_manager.eml         # -> task list
pnpm eml trace examples/todo-list-manager/todo_list_manager.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/todo-list-manager/todo_list_manager.eml   # -> OK (fixpoint)
```
