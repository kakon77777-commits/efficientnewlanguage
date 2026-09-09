# The review approved the diff and the merge used a different base

`the_review_approved_the_diff_and_the_merge_used_a_different_base.eml` - Nothing reaches the payments service without two approvals, a green build and somebody other than the author pressing merge, and the policy has held for forty months. What the approval was given against is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The policy is enforced rather than published. The branch is protected, so the two approvals and the green build are conditions the server checks and not a convention; self-merge is refused; and ninety-one changes a month are held at that gate rather than waved through.

The reviewers read a diff against the base as it stood when they opened it. The merge builds a tree from the base as it stands when the button is pressed.

```
merges a month                  : 214
approvals required              : 2
self-merges                     : 0
changes held at the gate a month: 91
months the policy has run       : 40
merges under the policy         : 8560
```

```
base moved after last approval  : 137
  base stood still              : 77
  moved share                   : 6401 per ten thousand
  commits it moved by, mean     : 9
  commits joining unreviewed    : 1233
```

```
re-reviewed after the base moved: 0
builds run on the merge result  : 0
incidents from an unseen pair   : 4
  per merge                     : 4 per ten thousand
```

```
the merge policy
  where it lives : in branch protection, so the
    approvals and the build are server-side conditions
    rather than a convention
  approvals : 2, and the author may not be one
  self-merges in 40 months : 0
  changes held at the gate a month : 91
  verdict : REVIEWED
```

```
  putting the rule in branch protection rather than in a
  document is the part almost nobody does, and it is why
  the 0 is a fact and not a claim
```

```
two objects
  what the reviewer read : the change against the base
    as it stood when they opened it
  what the merge produced : the change against the base
    as it stands when the button is pressed
  when those are the same tree : when nothing landed in
    between
  merges where that held : 77
  merges where it did not : 137
```

```
  both approvals are about a tree; the tree that shipped
  is a third one nobody opened
```

```
the commits that arrive alongside
  base moved by, on average : 9 commits
  so commits joining a change unreviewed with it : 1233
    a month
  were those commits reviewed : yes, each on its own
    base, by 2 people
  was any pair of them read together : no
  re-reviews triggered by the base moving : 0
```

```
  every commit is reviewed and no combination is; the
  gate is per change and the tree is a combination
```

```
null control - build the merge result, not the branch head
  self-merges : 0, unchanged
  builds run on the merge result : 214
  that fail while the change passed alone : 26
  the review did not become stricter; something finally
  looked at the tree that was going to exist
```

```
what a fully reviewed branch guarantees
  every change was read by 2 people against the tree it
    was written on : exactly, 40 months, 0 exceptions
  every tree that reached production was read by anyone
    : not addressed; that tree is first assembled by the
    merge, after the last approval
```

```
approving a change is not approving a result; the result
is formed from the change and everything that arrived
while it waited, and nothing here reads it
```

Branch protection enforces 2 approvals and a green build server-side, 0 self-merges in 40 months, 91 changes held at the gate a month. The base moved after the last approval on 137 of 214 merges - 6401 per ten thousand - bringing 1233 commits a month into trees that 0 builds and 0 re-reviews ever saw.

Verify it yourself:

```bash
pnpm eml run examples/the-review-approved-the-diff-and-the-merge-used-a-different-base/the_review_approved_the_diff_and_the_merge_used_a_different_base.eml
```
