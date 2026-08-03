# The top three is not a set

`top_n_undefined_tiebreak.eml` computes "the top three" four ways over every permutation of a leaderboard with a three-way tie.

**What it exercises**: sort and take three does not say what to do when
the third and fourth entries are tied. Measured over 24 permutations:
first-three gives **6** distinct results and **3** distinct
memberships — the answer changes who is in it depending on input order.

Membership stability and order stability are different properties and
the usual fix addresses one. Deciding the boundary rule makes *who* is
in the list well defined; the dense policy is stable in membership and
still comes back in 6 different orders.

The strict policy is stable on both counts and returns **one** name out
of four, which this file did not expect and is worth keeping: a policy
can be perfectly reproducible by virtue of answering a smaller question.
Only extending the sort key to something unique settles both without
shrinking the answer.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
after appending an irrelevant last-place row:
  first-three: alice,bob,carol
  dense:       alice,bob,carol,erin
  strict:      alice
  tiebroken:   alice,bob,carol

checks passed: 5/5
Only a total order makes 'the top three' a single answer.

Membership stability and order stability are different properties and the
usual fix addresses one of them. Deciding the boundary rule makes WHO is in
the list well defined, and dense still comes back in a different order every
time. Strict is stable on both counts and returns one name out of five,
which is worth noticing: a policy can be perfectly reproducible by virtue of
answering a smaller question. Only extending the sort key to something
unique settles both without shrinking the answer.
```
