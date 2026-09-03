# The diff was reviewed and the generated file was not

`the_diff_was_reviewed_and_the_generated_file_was_not.eml` - Two people reviewed every line of the change and approved it. How many lines were in the change is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The review is real. Two approvals are required, from people who did not write the code; the reviewers read the eighty-four lines, asked two questions and had one of them answered with an edit. Nobody rubber-stamped anything and the process has caught defects that tests did not.

What a reviewer reads is what the diff view SHOWS. Generated files are marked in the repository's attributes so they collapse — a rule added because a lockfile update used to bury a one-line change under nine thousand lines of churn, which is a real problem and this is the standard fix.

The change also updated a lockfile. Inside it, one package's resolved URL points somewhere else.

```
lines a reviewer saw           : 84
lines in collapsed files       : 12400
lines in the change            : 12484
share collapsed                : 9932 per ten thousand
```

```
reviewers                      : 2
approvals                      : 2
substituted packages           : 1
```

```
the review
  approvals required : 2, from people who did not write it
  lines read         : 84
  questions asked    : 2
  answered with an edit : 1
  rubber stamps      : 0
  verdict            : REVIEWED
```

```
  this process has caught defects the tests did not, and
  the reviewers were reading rather than clicking
```

```
the generated-file rule
  added because      : a lockfile update buried a one-line
    change under nine thousand lines of churn
  is that a real problem : yes, and reviewers stopped
    reading everything when it happened
  the rule            : mark them generated, collapse them
  what it assumes     : generated content is a function of
    reviewed content
```

```
  that assumption holds for a stub regenerated from a
  schema in the same change; a lockfile also records where
  each package came from
```

```
one line inside the collapsed region
  package         : unchanged name, unchanged version
  resolved url    : a different host
  integrity hash  : present, and matching the thing at
    that host
  what a checker would compare it to : nothing; the hash
    attests the download, not the origin
```

```
the pipeline
  install         : succeeds
  integrity hash  : matches
  tests           : pass
  a check on the origin : none
  approvals       : 2
```

```
null control - resolved hosts summarised into an uncollapsed file
  lines a reviewer reads : 84 plus 1
  churn still collapsed  : yes, the rule still holds
  substitutions reaching main : 0
  the review did not get longer; the part of a generated
  file that is not derivable from the source came out of
  the collapsed region
```

```
what two approvals guarantee
  two people read the change : exactly, and read it
    carefully
  two people read what shipped : not addressed; the diff
    view decides what a reviewer is shown, and it was
    configured to hide the part nobody could usefully read
```

```
collapsing generated files assumes they are a function of
what was reviewed; a lockfile is mostly that and partly a
record of provenance, and the second part is the part worth
reading
```

Two reviewers read all 84 lines the diff showed, asked two questions, had one answered with an edit, and 0 approvals were rubber stamps. The change contains 12484 lines, of which 12400 are collapsed as generated - 9932 per ten thousand - and 1 package inside that region now resolves from a different host with an integrity hash that matches what is there.

Verify it yourself:

```bash
pnpm eml run examples/the-diff-was-reviewed-and-the-generated-file-was-not/the_diff_was_reviewed_and_the_generated_file_was_not.eml
```
