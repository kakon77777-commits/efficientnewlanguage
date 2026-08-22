# Enforcement decayed with distance from the author

`enforcement_decayed_with_distance_from_the_author.eml` - The convention is followed closely in the files its author touches and loosely elsewhere. The gradient is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Writing a convention down and then following it yourself is exactly right. The author's own files are the demonstration, they are where the reasoning is freshest, and a convention nobody follows anywhere is worse than one followed somewhere.

Following it elsewhere needs a reader to encounter it, understand why, and apply it to a case the document did not enumerate. Each of those attenuates with distance from the person who has the reason in their head, and none of them attenuates with how much the convention matters in that file.

Compliance is measured per module against that distance.

```
files in scope : 285
files following the convention : 139, which is 48%
```

```
module        hops   files   following   rate   defects it would prevent/yr
  core   0      40      39          97%    8
  adjacent   1      55      44          80%    9
  same org   2      70      35          50%    12
  other org   3      90      18          20%    15
  contractor   4      30      3          10%    6
```

```
compliance against distance
  the rate falls at every hop, without exception
  at 0 hops : 97%
  at 4 hops : 10%
  a drop of 87 points across 4 hops
```

```
the module where the convention prevents the most defects : other org, 15 a year
  its compliance rate : 20%, at 3 hops
```

```
defects the convention would prevent, by distance
  within 1 hop  : 17
  beyond 1 hop  : 33
  most of the available benefit is where the compliance is lowest
```

```
the adoption figure, as it is usually quoted
  files following it : 139 of 285, 48%
  what that number is a property of : how many files are near the author
  files within 1 hop : 95 of 285
  move the same convention into a codebase with a different shape and the
  adoption figure moves without anybody's behaviour changing
```

```
what a linter rule would do to the same gradient
  hops it attenuates over : 0
  what it cannot carry    : the reason, which is what lets a reader apply
  the convention to a case the rule does not match
  so the mechanical part travels and the judgement does not, and the
  question is which of the two the convention mostly is
```

```
control - the same convention in a single-team codebase
  hops in play : 1 value, 0
  compliance   : whatever the team decides, uniformly
  the convention is then simply followed or not, and its adoption figure is
  about the convention rather than about the org chart
```

Following your own convention is the right way to demonstrate one, and the author's files are at 39 of 40. What travels is the rule; the reason stays where it was written, and compliance follows the reason.

Verify it yourself:

```bash
pnpm eml run examples/enforcement-decayed-with-distance-from-the-author/enforcement_decayed_with_distance_from_the_author.eml
```
