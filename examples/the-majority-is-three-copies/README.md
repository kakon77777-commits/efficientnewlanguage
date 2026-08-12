# The majority is three copies — 4 members, 2 opinions

`the_majority_is_three_copies.eml` puts four implementations to a vote and
measures how much evidence the vote actually contains.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A is the original. B and C are ports of A into two other
services — real code, written by real people, in different languages, months
apart, and each one written by reading A. D was written from the specification.
On the disputed input the vote is three to one:

```
amount   A  B  C  D   majority   spec
  99     1  1  1  1     1         1
  100     1  1  1  2     1         2
  499     2  2  2  2     2         2
  500     2  2  2  3     2         3
  501     3  3  3  3     3         3
  inputs where the majority differs from the specification: 2
```

Nobody involved is being careless — a majority of *independent* implementations
is good evidence. The question is how many independent implementations there
are, and counting the files is not how you find out.

**The lineage is inferred from the answers, not from the comments:**

```
agreement between every pair of members
  A original and B port : identical on all 9 inputs
  A original and C port : identical on all 9 inputs
  A original and D from the spec : differ on 2
  B port and C port : identical on all 9 inputs
  B port and D from the spec : differ on 2
  C port and D from the spec : differ on 2
  pairs that never differ : 3

the ensemble
  members            : 4
  distinct behaviours : 2
  a vote among 4 members carries 2 opinions
```

**Counted properly, there is no majority at all:**

```
one vote per distinct behaviour, on the disputed inputs
  amount 100 : behaviour 1 says 1, behaviour 2 says 2 - tied
  amount 500 : behaviour 1 says 2, behaviour 2 says 3 - tied
  inputs where the two behaviours agree    : 7
  inputs where they tie, with no majority  : 2
```

A tie forces someone to open the specification. A three-to-one majority does
not, and that is the whole difference between the two counting rules.

**Where this round came from.** It was read off rounds 60 and 61 rather than
chosen in advance. Both left the same question hanging: when a disagreement
finally arrives, which side gets believed? In
[two-defects-cancel-in-the-round-trip](../two-defects-cancel-in-the-round-trip/)
the *more correct* state is the one that fails the test; in
[the-independent-check-is-a-translation](../the-independent-check-is-a-translation/)
the genuinely independent implementation is outvoted. This round is about the
tie-breakers, and every one of them turns out to favour lineage over evidence.

Verify it yourself:

```bash
pnpm eml run examples/the-majority-is-three-copies/the_majority_is_three_copies.eml
```
