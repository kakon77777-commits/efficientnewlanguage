# Balanced brackets checker

`balanced_brackets_checker.eml` checks seven sample strings for correctly
nested and matched brackets, covering the mismatched (`"(]"`), unclosed
(`"((("`), closer-before-opener (`")("`), and empty (`""`) edge cases as
well as the well-formed ones.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a list used as a stack — push via `stack + [ch] =>
stack`, pop via a slice rebuild `stack[0:depth - 1] => stack` (EML has no
`.pop()`) — plus two dicts, one as a set of openers and one mapping each
closer to its opener. An *application* of the data structure that
[`examples/simple-stack/`](../simple-stack/) defines in isolation.
Non-bracket characters are ignored, so `"a(b)c[d]"` still passes.

Verify it yourself:

```bash
pnpm eml transpile examples/balanced-brackets-checker/balanced_brackets_checker.eml   # -> Python
pnpm eml run examples/balanced-brackets-checker/balanced_brackets_checker.eml         # -> 7 "string -> bool" lines
pnpm eml trace examples/balanced-brackets-checker/balanced_brackets_checker.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/balanced-brackets-checker/balanced_brackets_checker.eml   # -> OK (fixpoint)
```
