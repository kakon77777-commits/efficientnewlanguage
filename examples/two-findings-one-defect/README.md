# Two findings, one defect — 2 causes each, 1 in the intersection

`two_findings_one_defect.eml` measures what routing two reports to two owners
destroys.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the reports look unrelated — different symptom, different
screen, different reporter, filed a week apart. Each goes to the team that owns
that screen, and each team does a competent job: finds a plausible local cause,
corrects it, closes the finding with a passing test.

Neither team is wrong about their own evidence. What the split destroys is the
**intersection**:

```
candidate causes, each enabled alone
  shared parser : reproduces finding 1 = 1, finding 2 = 1
  report-local : reproduces finding 1 = 1, finding 2 = 0
  scheduler-local : reproduces finding 1 = 0, finding 2 = 1

causes consistent with finding 1 alone : 2
    shared parser
    report-local
causes consistent with finding 2 alone : 2
    shared parser
    scheduler-local
causes consistent with BOTH            : 1
    shared parser
```

Each finding alone leaves two candidates. Together they name one. Handing each
owner half the evidence hands each of them the half that cannot decide — and
each will reasonably pick the local candidate, because that is the one they can
fix.

**Both findings close. The cause does not:**

```
after both owners patch their own screen
  report screen wrong  : 0
  reminder mails wrong : 0
  audit log wrong      : 5   still, and still unreported
  findings closed      : 2
  compensating offsets now in the codebase : 2

after fixing the shared parser
  report screen wrong  : 0
  reminder mails wrong : 0
  audit log wrong      : 0
  compensating offsets : 0
```

**And the two patches are a debt that comes due:**

```
if the shared parser is fixed later, with the two patches still in place
  report screen wrong  : 5 of 5
  reminder mails wrong : 5 of 5
```

Whoever eventually fixes the real cause breaks both screens, and their change is
the one that will be blamed.

Nothing is declared: each candidate cause is enabled alone and its witnesses are
measured, so the consistency sets are computed rather than argued.

**The mirror of
[one-report-two-mechanisms](../one-report-two-mechanisms/).** That case is a
report merged too far — one entry, two causes, and the fix degenerates into one
patch per witness. This one is a report split too far — two entries, one cause,
and the fix degenerates into one patch per owner. Both errors are in the
classification, both produce patch counts that track *reporting* rather than
*code*, and neither is visible from any single report.

Verify it yourself:

```bash
pnpm eml run examples/two-findings-one-defect/two_findings_one_defect.eml
```
