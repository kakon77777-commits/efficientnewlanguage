# What `int()` and `float()` actually accept

`numeric_string_parser.eml` walks fourteen candidate strings and reports,
for each, what `int()` and `float()` do with it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the real Python numeric-string grammar, including
the rows people guess wrong.

```
text                 int()              float()
-------------------- ------------------ ------------------
'  42  '             int -> 42          float -> 42.0
'1_000'              int -> 1000        float -> 1000.0
'2.5'                int -> ValueError  float -> 2.5
'0x10'               int -> ValueError  float -> ValueError
''                   int -> ValueError  float -> ValueError
'banana'             int -> ValueError  float -> ValueError
'inf'                int -> ValueError  float -> inf
'-Infinity'          int -> ValueError  float -> -inf
```

The rules worth remembering:

- Surrounding whitespace is stripped; **underscores are legal between
  digits**, exactly as in a numeric literal.
- `int()` never truncates *text*. `int("2.5")` is an error, while
  `int(2.5)` is `2` — and `int(-2.5)` is `-2`, toward zero rather than down.
- The empty string is **not** zero. Nothing in Python treats it as a number.
- `float()` accepts `inf`, `infinity` and `nan` case-insensitively, with an
  optional sign — but rejects hex, which is a literal form rather than a
  float string.

## Why this case exists

This list is exactly where the interpreter was wrong, and `float()` was
called by **zero** of the 149 corpus programs before this one.

It had been delegating to JavaScript's `Number()`, which disagrees with
Python on every surprising row: `Number("")` is `0`, `Number("0x10")` is
`16`, and both underscores and `"inf"` come back `NaN`.

The error guard made it worse. It was:

```js
if (Number.isNaN(n) && !/nan/i.test(s)) throw ...
```

so any string *containing* "nan" skipped the error path — and
`float("banana")` returned `nan` instead of raising, because **ba·nan·a**
matches. That is the kind of bug that only ever shows up on real input.

The grammar is now spelled out rather than borrowed, with underscores
expressed as `\d(?:_?\d)*` so that `1_000` parses and `_1`, `1_` and
`1__0` do not.

Verify it yourself:

```bash
pnpm eml run examples/numeric-string-parser/numeric_string_parser.eml
pnpm eml trace examples/numeric-string-parser/numeric_string_parser.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/numeric-string-parser/numeric_string_parser.eml   # -> OK (fixpoint)
```
