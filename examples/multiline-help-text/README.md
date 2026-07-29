# Triple-quoted strings, and the whitespace they capture

`multiline_help_text.eml` uses triple-quoted string literals, which EML
has supported since Phase 9 and which no corpus program had used.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a triple-quoted literal is the one place where the
**source layout is part of the value**. The newline right after the
opening quotes is real; the indentation of the continuation lines is
real; and both land in the string whether the author meant them or not.
That is the entire reason `textwrap.dedent` exists in Python's standard
library.

```
raw length: 176 characters
starts with a newline: True
ends with a newline:   True
```

EML has no dedent helper, so the program writes one — a better
demonstration anyway, because it has to reason about exactly the
whitespace that got captured:

```
  common indent: 4
  |
  |alpha
  |  beta
  |gamma
  |
  32 characters before, 20 after
  removed 12 = 4 x 3 indented lines
  The arithmetic checks out: exactly the common indent, three times.
```

**The character count is the check.** A dedent that stripped one space
too many or too few would still *look* fine — the output would be a
plausibly-indented block either way. Counting is what turns it into a
test.

It also splits lines by hand, since EML has no `.split()`, which is worth
seeing once: the trailing empty piece after the final newline is real,
and a splitter that quietly dropped it would misreport the line count.

Verify it yourself:

```bash
pnpm eml transpile examples/multiline-help-text/multiline_help_text.eml
pnpm eml run examples/multiline-help-text/multiline_help_text.eml         # -> lengths, split, dedent, arithmetic
pnpm eml trace examples/multiline-help-text/multiline_help_text.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/multiline-help-text/multiline_help_text.eml   # -> OK (fixpoint)
```
