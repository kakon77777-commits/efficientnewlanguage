# The check ran on commit and the merge was a squash

`the_check_ran_on_commit_and_the_merge_was_a_squash.eml` - Every commit on the branch was checked and every check passed. What was never checked is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The checking is thorough. It runs on every commit rather than only on the tip, so a bad intermediate state cannot hide inside a branch; it is the full suite, not a subset; and it has failed on real defects rather than sitting green as decoration. Forty-one commits, forty-one green runs.

What it checks is the branch's content against the base the branch STARTED from. Main has moved a hundred and twenty-eight commits since, and the state that will exist after the merge is the pair.

Git reports no conflict, because the two sides touch different files.

```
commits on the branch          : 41
checked, green                 : 41
main commits since it started  : 128
commits in the merged history  : 169
textual conflicts reported     : 0
checks run on the merged state : 0
```

```
the branch checks
  runs on            : every commit, not only the tip
  scope              : the full suite
  green              : 41 of 41
  has failed on real defects : yes
  verdict            : BRANCH IS GREEN
```

```
  checking every commit is stricter than checking the tip
  and it costs more; this is the careful configuration
```

```
the state under test
  branch content     : as authored
  base               : where the branch started
  main's 128 later commits : not present in any run
```

```
  every run measured a state that existed; none of them
  measured the state that will exist
```

```
the merge
  files the branch touched : 9
  files main touched       : 61
  files in both            : 0
  conflicts git can see    : 0
  squashed to              : one commit, whose content is a
    state nothing has run against
```

```
share of the merged history the branch never saw : 7573 per ten thousand
```

```
found after the merge, on main
  a renamed helper with three new callers of the old name
  a config key both sides added, with different defaults
  a migration ordering that is fine either way alone
  each side, checked alone : green
  the pair, checked        : never, until main was red
```

```
null control - one run on the merge result
  branch checks       : 41, unchanged
  runs on the merged state : 1
  conflicts reaching main : 0
  the branch did not become better tested; the state that
  ships stopped being the one state nothing had run
```

```
what a green branch guarantees
  every commit on it is good : exactly, and more than most
    projects check
  the merge is good          : not addressed; the merge is
    a state neither side ever built, and a conflict
    detector that compares text cannot see it
```

```
checking harder along one line does not reach the point where
two lines meet; the only run that can is one on the result,
and it is the run a squash makes look redundant
```

Every one of 41 commits was checked with the full suite and 41 were green, which is stricter than checking the tip. Main moved 128 commits meanwhile - 7573 per ten thousand of the merged history - and git reported 0 conflicts because the two sides touch no common file, so 0 runs ever saw the state that shipped and 3 defects were found on main instead.

Verify it yourself:

```bash
pnpm eml run examples/the-check-ran-on-commit-and-the-merge-was-a-squash/the_check_ran_on_commit_and_the_merge_was_a_squash.eml
```
