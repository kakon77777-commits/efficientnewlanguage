# `min()` and `max()` have two call shapes

`min_max_selection.eml` demonstrates the rule that decides which one you
are using, and the sharp edge it creates.

```
max(a, b, c)   compare the ARGUMENTS
max(iterable)  compare the ITEMS of the one argument
```

One argument always means "look inside this".

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: both call shapes over lists, tuples and strings;
tie-breaking; and the two error cases.

```
  max("hello")      -> 'o'
  max("pear", "fig") -> 'pear'
  max(2, 2.0) -> 2   (int, the first argument)
  max(2.0, 2) -> 2.0 (float, the first argument)
  max(5) raised TypeError: 'int' object is not iterable
  min([]) raised ValueError: min() iterable argument is empty
```

`max("hello")` is `'o'`, not `"hello"` — a string is iterable, so a single
string argument compares its characters. And `max(5)` is a **TypeError**,
not `5`, because an int is not iterable and a lone argument is never
treated as a one-element sequence.

Ties keep the first value seen, which you can only observe through `repr`:
`max(2, 2.0)` and `max(2.0, 2)` are equal but not identical, and the one
that survives is whichever came first.

## Two bugs this case fixed

Both of the shapes above were wrong before this program was written:

- `max("hello")` returned `"hello"` — the interpreter special-cased `list`
  and treated any other single argument as a one-item sequence.
- `max(5)` returned `5` for the same reason, where Python raises.

Neither raised. Both returned something plausible. The corpus had not
noticed because `min()` was called by **zero** of 149 programs and `max()`
by exactly one.

A third divergence turned up only when this case printed the error text:
the interpreter said `min() arg is an empty sequence`, CPython 3.12+ says
`min() iterable argument is empty`. The message was checked against the
local interpreter rather than recalled from memory.

Verify it yourself:

```bash
pnpm eml run examples/min-max-selection/min_max_selection.eml
pnpm eml trace examples/min-max-selection/min_max_selection.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/min-max-selection/min_max_selection.eml   # -> OK (fixpoint)
```
