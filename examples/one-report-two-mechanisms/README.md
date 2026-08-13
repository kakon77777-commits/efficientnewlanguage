# One report, two mechanisms — 3 items named, 7 wrong, 2 causes

`one_report_two_mechanisms.eml` takes an honest, well-evidenced defect report
and measures what its *shape* does to the fix.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the report lists three inputs, their actual outputs, and
their correct outputs. It is not wrong about anything. What it cannot say —
because the reporter is outside — is that two of the three come from one
mechanism and the third from another.

```
the report: three wrong outputs
  input -4 : actual 4, correct -4
  input 150 : actual 99, correct 150
  input -7 : actual 7, correct -7

inputs rendered wrongly by the shipped code : 7 of 12
inputs named in the report                  : 3
```

**Fix A — correct exactly what the report named:**

```
  reported inputs now correct : 3 of 3
  inputs still wrong          : 4
    -9 : 9 (correct -9)
    100 : 99 (correct 100)
    260 : 99 (correct 260)
    -1 : 1 (correct -1)
```

**Fix B — correct the mechanisms:**

```
after correcting the two mechanisms
  inputs still wrong : 0
```

**The attribution needs the inside.** Running each mechanism alone is not
something the reporter could do:

```
attribution of the reported inputs
  -4 : mechanism 1 (sign)
  150 : mechanism 2 (clamp)
  -7 : mechanism 1 (sign)
  distinct mechanisms behind a 3-item report : 2

mechanisms that are actually defective : 2
  wrong outputs with both on   : 7
  with mechanism 1 switched off : 3
  with mechanism 2 switched off : 4
```

**Both routes reach zero. They cost differently, and only one of them stops:**

```
corrections needed to reach zero wrong outputs
  by patching each reported output : 7
  by correcting each mechanism     : 2

  after 7 patches, inputs still wrong : 0
  after 2 mechanism fixes, inputs still wrong : 0
```

The patch count is a function of the inputs anyone happened to try. The
mechanism count is a property of the code. On a value neither the report nor the
tested set contains:

```
a value outside both the report and the tested set
  shipped        : 99  (correct -250)
  after patching : 99
  after fixing   : -250
```

Nothing is declared: the correct value is computed independently, each failure
is attributed by running one mechanism at a time, and the number of defective
mechanisms is measured by switching each off and seeing whether the failure
count falls.

**Where this round comes from.** Rounds 60-63 are about why a system cannot find
out it is wrong. This round is the next link: a defect that *has* been found
still has to travel — observed, described, transmitted, reproduced, located,
grouped — before anything gets fixed, and each of those steps can quietly drop
or reshape it. A report describes outputs because outputs are what an outsider
can see; reading it as a list of outputs is the reading that never terminates.

Verify it yourself:

```bash
pnpm eml run examples/one-report-two-mechanisms/one_report_two_mechanisms.eml
```
