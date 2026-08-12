# Both sides share the normaliser — 4 behaviours change, the suite sees 0

`both_sides_share_the_normaliser.eml` runs the same behaviours under two test
styles and measures exactly how much sharing a helper costs.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the test normalises its expected value with the same
function the code under test uses. That is not laziness — it is the obvious way
to keep a comparison from failing over trailing spaces. Against a correct
implementation the two styles are indistinguishable:

```
against the correct implementation
  shared-normaliser style : 6 pass
  independent style       : 6 pass
```

Break the shared normaliser so it also drops hyphens:

```
against an implementation whose normaliser also drops hyphens
  shared-normaliser style : 6 pass
  independent style       : 2 pass

per behaviour, with the broken normaliser
  AB-12 -> AB12 (want AB-12)  : only the independent style fails
   7-7  -> 77 (want 7-7)  : only the independent style fails
  X - 9 -> X9 (want X-9)  : only the independent style fails
  -01- -> 01 (want -01-)  : only the independent style fails
  behaviours the defect actually changes : 4
  of those, the shared style catches     : 0
```

**The cost is precise and local, which is why this survives review.** A defect
anywhere *else* is caught by both styles equally, because only one side of the
comparison passes through the shared function:

```
a defect OUTSIDE the shared function, same two styles
  shared-normaliser style : 0 pass of 6
  independent style       : 0 pass of 6
  the two styles agree here, so the blindness is local to the shared code
```

So the honest statement is not "sharing a helper weakens the suite". It weakens
it in exactly one place — inside the shared function — and that place is not
visible from either file. It is visible only from the import list.

The expected strings are the one thing in this program written out rather than
computed, which is the whole point of the case. Every count of agreement and
detection is measured.

Verify it yourself:

```bash
pnpm eml run examples/both-sides-share-the-normaliser/both_sides_share_the_normaliser.eml
```
