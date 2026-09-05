# The review caught the bug and the revert was partial

`the_review_caught_the_bug_and_the_revert_was_partial.eml` - A reviewer found the defect, the author agreed, and the commit was reverted cleanly before release. What the revert removed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The review worked exactly as it is supposed to. A human reading a diff noticed that a comparison was wrong, said so, and was right; the author agreed within the hour; the offending commit was reverted; the revert applied with no conflict; a second reviewer confirmed the reverting diff was the exact inverse of the original; and the full suite was green afterwards. Three hundred forty defects were caught this way this year.

A revert is the inverse of a DIFF. It restores the lines that commit changed, and in the twenty-six days between the commit and the review the function had been extracted and called from two more places.

The revert removed one of the three call sites.

```
defects caught in review this year : 340
conflicts when the revert applied  : 0
second reviewers confirming the inverse : 1
failing tests after the revert     : 0
```

```
days between the commit and the review : 26
commits touching the file in between   : 14
```

```
call sites when the defect was introduced : 1
call sites when the revert was written    : 3
  removed by the revert                   : 1
  remaining                               : 2
  share remaining                         : 6666 per ten thousand
tests asserting the behaviour is gone     : 0
```

```
the review
  found by : a person reading the diff
  the finding : a comparison that was wrong
  was it right : yes, and the author agreed within the hour
  defects caught this way this year : 340
  verdict : CAUGHT
```

```
  a reviewer who reads carefully enough to find a wrong
  comparison is the most valuable thing in this list
```

```
the revert
  applied with conflicts : 0
  confirmed as the exact inverse of the original diff : by
    1 second reviewer
  suite after it : 0 failing
  what it restored : the lines that commit changed
  verdict : INVERTED
```

```
  every one of those checks passed, and each of them is a
  statement about the diff
```

```
the file between the commit and the review
  commits touching it : 14
  the logic was       : extracted into a function
  callers added       : two, in ordinary feature work
  did either author know : no; nobody knew yet
  call sites at review time : 3
```

```
the clean apply
  what a conflict would indicate : the original lines moved
  what a clean apply indicates   : they did not
  what either indicates about copies elsewhere : nothing
  files the original commit touched : the one it touched
  files the copies live in : two others
```

```
the suite
  green before the defect : yes
  green after the defect  : yes, which is why a human
    found it and not a test
  green after the revert  : yes
  tests asserting the behaviour is gone : 0
  so the suite is measuring : that nothing else broke
```

```
null control - the finding is written as a failing test
  defect found by review : the same reviewer, unchanged
  tests asserting the behaviour is gone : 1
  call sites the fix must reach : 3
  call sites remaining : 0
  the review did not get better; the finding stopped being
  addressed to a commit and started being addressed to a
  behaviour
```

```
what a clean revert guarantees
  the tree no longer contains that commit's changes :
    exactly, and it was confirmed line by line
  the defect is gone                                : not
    addressed; a commit is a location in a history and a
    defect is a behaviour that can be copied
```

```
a fix aimed at a commit is aimed at the place the defect was
introduced; between introduction and discovery the code
moves, and only a test names the behaviour rather than the
place
```

The review did the hard part: a person read the diff, found a wrong comparison, was right, and 340 defects were caught this way this year. The revert applied with 0 conflicts, was confirmed as the exact inverse of the original, and left 0 tests failing - and in the 26 days and 14 commits since, the logic had been extracted, so 2 of 3 call sites - 6666 per ten thousand - survived, with 0 tests naming the behaviour.

Verify it yourself:

```bash
pnpm eml run examples/the-review-caught-the-bug-and-the-revert-was-partial/the_review_caught_the_bug_and_the_revert_was_partial.eml
```
