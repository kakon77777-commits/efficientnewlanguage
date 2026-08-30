# The diff was empty and the behaviour changed

`the_diff_was_empty_and_the_behaviour_changed.eml` - Two builds of the same commit behave differently. The diff between them is empty. What was not in the diff is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The version control is correct and the check that was run is the right one. Comparing the two deploys by commit is exactly how you rule out a code change, it takes seconds, and it answered truthfully: the tree hashes match, so nothing anybody wrote is responsible. That conclusion was reached properly.

A commit fixes the source this repository holds. It does not fix what the source RESOLVES TO, and every dependency specified as a range is resolved at build time from a registry that changes without asking.

So the build is reproducible with respect to everything it records, and the thing that moved is the thing it does not record.

```
dependencies resolved at build : 214
specified as a range, direct   : 6
specified as a range, indirect : 41
```

```
the check that was run
  commit, build A          : identical
  commit, build B          : identical
  tree hash                : identical
  lines changed            : 0
  files changed            : 0
  conclusion               : no code change
```

```
  every one of those is true, and the conclusion follows
  from them correctly
```

```
what the two builds do not share
  dependencies free to differ  : 47
  share of the tree            : 2196 per ten thousand
  that actually differ         : 2
  recorded anywhere in the repo: 0
```

```
  the diff is empty because the diff is over the repository,
  and 47 of the inputs are not in the repository
```

```
input                          fixed by the commit
  source files                 yes
  167 pinned dependencies        yes
  47 ranged dependencies         no
  compiler version             no
  base image                   no
  build-time environment       no
```

```
  a commit is a statement about the first two rows
```

```
month   ranged deps that published   builds still identical
  1       2                            no
  2       4                            no
  3       6                            no
  4       8                            no
```

```
  the diff is empty at every row
```

```
what each available check can distinguish
  git diff between the deploys      : source only
  comparing the built artefacts     : yes, byte for byte
  a lockfile covering transitives   : yes, before the build
  rerunning the tests               : only if a test reaches it
```

```
  the first is the fastest and the only one that was run,
  which is a reasonable order to try them in and not a
  reasonable place to stop
```

```
control - was the check wrong
  commits compared correctly     : yes
  false 'no change' verdicts      : 0
  source changes missed           : 0
  defects in version control      : 0
```

```
  the tool answered its question exactly; the question was
  narrower than the one being investigated
```

```
null control - the same commit with a full lockfile
  dependencies free to differ : 0
  builds identical            : yes, byte for byte
  git diff                    : empty, as before
  the diff did not become more informative
  it became true of everything that matters
```

```
what an empty diff rules out
  a change to the tracked source : completely
  a change to the build's inputs : only the tracked ones
  and the untracked inputs are untracked precisely because
  somebody decided they were not worth recording
```

```
the comparison that answers 'why did this change' is between
the artefacts, not between the commits; the commits are what
you compare to find out WHO changed it
```

The commits are identical, the tree hashes match, 0 files and 0 lines differ, and version control answered that correctly in seconds. Of 214 dependencies 47 are specified as ranges - 2196 per ten thousand of the tree - and 2 published new versions between the two builds, none of it recorded in the repository, so the diff stays empty for as long as anyone keeps asking it.

Verify it yourself:

```bash
pnpm eml run examples/the-diff-was-empty-and-the-behaviour-changed/the_diff_was_empty_and_the_behaviour_changed.eml
```
