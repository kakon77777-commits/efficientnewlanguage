# Two systems both claim it — both reports were honest and their sum was not

`two_systems_both_claim_it.eml` runs two attribution platforms over the same
ten conversions, reports each one's internal reconciliation, then compares the
naive sum against reality and attributes the excess.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: each platform's denominator is its own visibility, and
the word it uses for the numerator is "conversions".

| platform | owns | claims | its own reconciliation |
| --- | --- | --- | --- |
| adnet | search, display | 6 | attributed == observed |
| analytics | email, social, search | 7 | attributed == observed |

```
sum of the two platforms' claims: 13
conversions that actually happened: 10
excess: 3
```

Neither platform overclaims: nothing is attributed that it cannot see. The
failure is at the seam.

The arithmetic, computed on both sides rather than asserted:

```
naive sum minus reality:                                3
sum of (claims - 1) over multiply-claimed conversions:  5
...minus the conversions nobody claimed:                3
```

Five conversions are claimed twice, and **two are claimed by nobody** —
`direct` and `direct + organic`, channels neither platform owns. Those are not
exotic; in most real datasets they are the single largest bucket, and they
appear in no report at all.

```
adnet      sees 6 of 10 (60.0% of reality), and reports 100% of what it sees
analytics  sees 7 of 10 (70.0% of reality), and reports 100% of what it sees
```

Adding two counts is the obvious thing to do with two counts, and it is the one
operation neither system's reconciliation covers — because reconciliation stops
at the system boundary, and so does everyone who owns one.

Verify it yourself:

```bash
pnpm eml run examples/two-systems-both-claim-it/two_systems_both_claim_it.eml
```
