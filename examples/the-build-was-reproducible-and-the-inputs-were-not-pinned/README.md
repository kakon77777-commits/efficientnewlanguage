# The build was reproducible and the inputs were not pinned

`the_build_was_reproducible_and_the_inputs_were_not_pinned.eml` - Two independent builders produce byte-identical artifacts, every time. Whether two builds nine days apart agree is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reproducibility is real and it took work. Timestamps are zeroed, the file order is sorted, the build path is normalised, no absolute paths leak into the binary, and a nightly job builds the same commit on two machines with different kernels and compares hashes. It has never disagreed.

Reproducible means: same inputs, same output. It is a property of the FUNCTION. It says nothing about whether the input set is the same thing on Tuesday that it was the Monday before.

Every direct dependency is pinned to an exact version. Of the transitive closure, seven hundred and six resolve through a range, and thirty-one of those published a new patch release in the last nine days.

```
direct dependencies         : 84
  pinned exactly            : 84
  unpinned                  : 0
transitive dependencies     : 1247
  pinned                    : 541
  resolved through a range  : 706
  moved in the last 9 days  : 31
```

```
two builders, same commit
  timestamps zeroed      : yes
  file order sorted      : yes
  build path normalised  : yes
  absolute paths in the binary : 0
  hash disagreements     : 0
  verdict                : REPRODUCIBLE
```

```
  the two machines run different kernels and it still
  holds; this is not a weak test
```

```
what the two builders share
  the commit           : the same
  the resolution step  : run once, on one machine, and
    its result handed to both
```

```
  so the comparison holds the input set fixed by
  construction, which is the one thing it is being used
  as evidence about
```

```
share of the closure behind a range : 5661 per ten thousand
```

```
building the same commit twice
  on one day, on two machines : identical
  on two days, on one machine : 31 packages differ
  artifacts identical         : no
  either build reproducible   : yes, both
```

```
  reproducible and different is not a contradiction; the
  function is deterministic and it was called twice with
  different arguments
```

```
what a reader takes from it
  claim in the release note : reproducible, verified
  what a reader wants       : rebuild this tag next year
    and get this artifact
  packages that would have to not publish : 706
```

```
null control - the resolved closure committed
  builder disagreements   : 0, unchanged
  dependencies pinned     : 1247
  packages that can move  : 0
  the build did not become more deterministic; the input
  set stopped being a query
```

```
what a reproducible build guarantees
  same inputs give the same bytes : exactly
  the same tag gives the same bytes : not addressed, and
    the nightly comparison cannot address it because it
    resolves once and hands the result to both machines
```

```
determinism is about the function; recoverability is about
the arguments, and a test that fixes the arguments to compare
the function has no opinion on the second
```

The build is reproducible and the nightly comparison is right: 0 disagreements across two kernels, 0 absolute paths, timestamps zeroed. All 84 direct dependencies are pinned exactly, and 706 of the 1247 in the closure resolve through a range - 5661 per ten thousand - of which 31 published in nine days, so the same commit built twice nine days apart is two different artifacts, both reproducible.

Verify it yourself:

```bash
pnpm eml run examples/the-build-was-reproducible-and-the-inputs-were-not-pinned/the_build_was_reproducible_and_the_inputs_were_not_pinned.eml
```
