# What `%` does with its right operand

`percent_format_arguments.eml` — walks the argument rules of %-formatting.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuple-vs-single-value, and the leftover-argument check.

The rule that looks arbitrary:

```
"ab" % 5        TypeError: not all arguments converted
"ab" % [1, 2]   "ab"          no error
"ab" % {"a":1}  "ab"          no error
```

CPython skips the leftover check whenever the right operand is **mapping-like**,
and its `PyMapping_Check` counts a *list* because a list has `__getitem__`. So
the distinction is about the type's protocol, not the role you had in mind.
Verified against 3.14; this interpreter raised TypeError for both.

Verify it yourself:

```bash
pnpm eml run examples/percent-format-arguments/percent_format_arguments.eml
pnpm eml trace examples/percent-format-arguments/percent_format_arguments.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/percent-format-arguments/percent_format_arguments.eml   # -> OK (fixpoint)
```
