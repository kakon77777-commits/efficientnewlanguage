# The verifier reran the fixer's script — 0 escapes, and 9 inputs never seen

`the_verifier_reran_the_fixers_script.eml` runs three input sets against the
same repair and counts what each can find.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the process is right — the person who wrote the fix does
not get to say it is fixed; somebody else re-runs it and confirms. What the
process does not say is where the second person gets their *inputs*, and the
convenient answer is the script attached to the fix.

```
escapes found, against the repaired validator
  the fixer's own inputs      : 0 of 4
  the fixer's inputs plus two : 0 of 6
  independently generated     : 1 of 13

inputs the repaired validator still gets wrong
  'zz99' : escaped, and it was not in the fixer's set
```

The repair rejects the uppercase form only — which is every example the fixer
had in front of them while writing it.

**Adding more inputs from the same source buys nothing:**

```
new escapes bought by adding two inputs of the same shape : 0
new escapes bought by generating inputs from the rule     : 1

input coverage
  independently generated inputs : 13
  of those, present in the fixer's set : 4
  inputs the verifier would never see if reusing the script : 9
```

**And a control, so the counts mean something:**

```
control: the independent set against a correct validator : 0
  the set reports nothing when there is nothing, so its other counts mean something
```

The independent set is not simply an alarm that always rings — against a
validator that implements the rule exactly it reports zero.

Nothing is declared: three sets are run against the same repair, the overlap is
computed rather than assumed, and the escapes are found by comparing against the
rule.

Re-running somebody else's script is an independent execution of a dependent
choice. The execution was never the part at risk.

**Related, and a different question.**
[the-independent-check-is-a-translation](../the-independent-check-is-a-translation/)
is about a second *implementation* that shares its lineage with the first. This
one is about a second *reviewer* who shares their inputs — the person is
genuinely independent and the evidence is not.

Verify it yourself:

```bash
pnpm eml run examples/the-verifier-reran-the-fixers-script/the_verifier_reran_the_fixers_script.eml
```
