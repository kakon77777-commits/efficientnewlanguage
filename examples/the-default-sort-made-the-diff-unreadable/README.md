# The default sort made the diff unreadable

`the_default_sort_made_the_diff_unreadable.eml` - A generated configuration file is regenerated on every build and committed. How much of each diff is a real change is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Not sorting the output is the right default for the serializer and it was chosen deliberately. Sorting costs time on files that can be large, iteration order is not part of the format's contract so relying on it would be a bug, and for a file that is READ by a program the order carries no meaning at all. The serializer is used in many places where the output is never seen by a person, and for those it is exactly right.

This file is committed, so it is also read by people, and by a diff. A diff does not know that order is meaningless. It reports every line whose position changed, because for most files a moved line is a fact worth showing.

The generator is deterministic given its input, which is the property the team checked. It is not deterministic given a rebuild on a different process, which is where the hash seed lives.

```
keys in the file           : 240
keys a real edit touches   : 3
```

```
  lines expected to keep their position : 1
  lines expected to move                : 239
  diff lines from reordering            : 478
  diff lines from the actual change     : 6
  signal to noise                       : 1 to 79
```

```
a review of this diff
  lines to read            : 484
  lines that matter        : 6
  time to find them by eye : longer than reading the source change itself
  what reviewers do instead: approve the file unread
```

```
  and once it is approved unread, the file is outside review entirely,
  including on the day the real change is three lines nobody wanted
```

```
with the keys sorted before writing
  lines that move from reordering : 0
  diff lines from reordering      : 0
  diff lines from the change      : 6
  signal to noise                 : 1 to 0
  cost : one sort of 240 keys, once per build
```

```
the determinism check that was run
  generate twice in one process, compare : identical
  generate on two machines, compare      : not run
  generate in two processes, compare     : not run
  the property that was verified : same process, same output
  the property that matters      : same input, same output
```

```
  a second run in the same process shares the seed, so it cannot
  distinguish the two
```

```
changes this diff would hide equally well
  the intended three-line edit          hidden
  a value edited by a bad merge         hidden
  a key removed by a generator bug      hidden
  a credential accidentally interpolated hidden
  the noise does not discriminate between what it hides
```

```
control - is the generated file correct
  keys present            : 240
  keys with correct values: 240
  wrong or missing entries: 0
  the file is correct on every line, in every build
```

```
  correctness of the file and readability of the diff are different
  properties, and only one of them was ever a requirement
```

```
null control - the same serializer for a file nobody commits
  reviewers            : 0
  diffs produced       : 0
  cost of the ordering : 0
  time saved by not sorting : real, on every build
  same serializer, same default, and here it is simply better
  the cost appears only when the output crosses into a place where
  position carries meaning, and a git repository is such a place
```

```
unspecified order, in an output that will be diffed
  is the order part of the format's contract   no
  is relying on it a bug                       yes
  does a diff rely on it                       yes, unavoidably
  a diff is a tool for a format whose order means something,
  pointed at a format whose order means nothing
```

```
the fix is not to make the diff smarter
it is one sort, in the writer, so the file has an order to be stable in
```

Not sorting is right for a serializer whose output is read by programs, and relying on iteration order would be a genuine bug. This file is committed, so a diff reads it, and a diff reports position. A random permutation leaves 1 line in place on average, so 239 of 240 move and produce 478 diff lines around the 6 that anyone meant to make.

Verify it yourself:

```bash
pnpm eml run examples/the-default-sort-made-the-diff-unreadable/the_default_sort_made_the_diff_unreadable.eml
```
