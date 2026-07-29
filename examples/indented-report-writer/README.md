# A context manager that isn't about resources

`indented_report_writer.eml` uses `with` to manage the *shape of output*
rather than to release anything.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: indentation is exactly the kind of state `with` is
good at. It must go up on the way in and back down on the way out, on
every path — and a stray early exit that forgot to un-indent would
corrupt every line printed afterwards. Writing it as a manager makes that
impossible to get wrong rather than merely easy to get right.

```
report
  summary
  details
    inputs
    outputs
      primary
      secondary
  appendix

printed pads:  [0, 2, 2, 4, 4, 6, 6, 2]
expected pads: [0, 2, 2, 4, 4, 6, 6, 2]
  Every line's indentation matches the tree depth it came from.
Deepest nesting reached: 3 levels.
Writer depth after all blocks closed: 0 (must be 0).
```

**No depth is hardcoded.** It comes purely from how deep the recursion
happens to go, and the manager tracks it. The check re-derives the
expected leading-space count for every line straight from the tree and
compares it against what was actually printed — which is what makes this
a test rather than a picture.

**The last number is the real assertion.** Every `with` that raised the
depth lowered it again on the way out, including the ones several frames
deep in the recursion, so the writer ends exactly where it started.

Verify it yourself:

```bash
pnpm eml transpile examples/indented-report-writer/indented_report_writer.eml
pnpm eml run examples/indented-report-writer/indented_report_writer.eml         # -> the tree, then pads match, depth 0
pnpm eml trace examples/indented-report-writer/indented_report_writer.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/indented-report-writer/indented_report_writer.eml   # -> OK (fixpoint)
```
