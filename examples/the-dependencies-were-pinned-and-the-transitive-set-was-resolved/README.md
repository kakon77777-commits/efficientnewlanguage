# The dependencies were pinned and the transitive set was resolved

`the_dependencies_were_pinned_and_the_transitive_set_was_resolved.eml` - Every direct dependency is pinned to an exact version, reviewed on change, and the build fails on a range. How much of the tree that fixes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pinning discipline is real. Nothing is specified as a range or a caret; every direct dependency names an exact version; a change to any of them is a reviewed diff with a named approver; a lint rule fails the build if a range reappears; and this replaced a period where two incidents were traced to a minor release nobody chose.

A direct dependency is pinned. Its own dependencies are resolved by the package manager at install time from whatever satisfies their ranges, and those ranges were written by somebody else.

Forty-one direct dependencies bring in nine hundred and six others.

```
direct dependencies             : 41
  pinned to an exact version    : 41
  ranges the lint rule allows   : 0
incidents before pinning        : 2
```

```
transitive dependencies         : 906
packages in the build           : 947
  chosen by a reviewed diff     : 41
  chosen by the resolver        : 906
  share chosen by review        : 432 per ten thousand
```

```
lockfiles committed             : 1
reviews that read the lockfile diff : 0
transitive versions in the reviewed diff : 0
```

```
the pinning rule
  ranges or carets anywhere direct : 0
  every direct dependency names : an exact version
  a change to one is : a reviewed diff with a named
    approver
  enforced by : a lint rule that fails the build
  what it replaced : a period with 2 incidents traced
    to a minor release nobody chose
  verdict : PINNED
```

```
  machine-enforced exact versions on every direct edge is
  the strong form of this, and the two incidents stopped
```

```
the scope of one pin
  what it fixes : the version of that package
  what that package's own manifest contains : ranges
  who wrote those ranges : its author, for their reasons
  when they are resolved : at install, against whatever
    the registry holds then
  packages resolved that way : 906
  share of the build a reviewed diff chose : 
    432 per ten thousand
```

```
  the discipline is complete over the edges this project
  declares, and a build is a closure over all of them
```

```
the lockfile
  committed : 1
  does it make the build reproducible : yes
  does it make the set chosen : no; it records what the
    resolver picked
  reviews that read its diff : 0
  what a reviewer sees on a routine update : nine hundred
    changed lines and an approval to give
```

```
the same failure today
  a minor release nobody chose : still possible, one hop
    down
  would the lint rule fire : no; it checks direct edges
  would the reviewed diff show it : the lockfile would
    change; 0 reviews read it
  would the build fail : no
  incidents this class produced before pinning : 
    2
```

```
null control - the resolved set is reviewed as a list
  direct pins : 41, unchanged
  packages a review can see : 947
  transitive versions in the reviewed diff : 
    906
  nothing became more pinned; the set the resolver chose
  became something a person is asked about
```

```
what exact pinning guarantees
  the versions this project names will not change :
    exactly, enforced by a failing build
  the versions this build contains will not change : not
    addressed; the project names 41 of 947 and the
    rest are a closure computed at install
```

```
a constraint applied to the edges you declare is complete
over those edges; a dependency tree is transitive and the
discipline is not, so the guarantee covers the first hop and
the risk lives in the other nine hundred
```

Every one of 41 direct dependencies is pinned exactly, changed only by a reviewed diff, with 0 ranges allowed by a lint rule that fails the build - and the 2 incidents it was written for stopped. A pin fixes one package, so of 947 packages in the build 906 are chosen by the resolver - review covers 432 per ten thousand - under 0 reviews that read the lockfile.

Verify it yourself:

```bash
pnpm eml run examples/the-dependencies-were-pinned-and-the-transitive-set-was-resolved/the_dependencies_were_pinned_and_the_transitive_set_was_resolved.eml
```
