# The checker inherits the builder's vocabulary — 6 of 6 named, 0 of 6 unnamed

`the_checker_inherits_the_builders_vocabulary.eml` measures a doc-led search's
recall, split by whether the defect's class has a name in the docs.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: reading the builder's documentation is how a new checker
becomes useful in a day instead of a month. It also hands them the builder's
list of concepts — and the docs name every concept the builder has a word for,
which is exactly the set they were already thinking about while writing the code.

```
defect classes present in the system : 6
classes the documentation names       : 3
classes with no word in the docs      : 3  ['ordering', 'aliasing', 'encoding']

the doc-led checker
  defects in documented classes : 6 of 6
  defects in undocumented classes : 0 of 6
  overall : 6 of 12
```

Perfect recall inside the vocabulary, zero outside it. The overall number —
6 of 12 — looks like ordinary partial coverage and hides the split completely.

**A second searcher's value depends entirely on where their vocabulary came
from:**

```
the shape-led checker
  overall : 6 of 12

  reached by both        : 2
  doc-led only           : 4
  shape-led only         : 4
  reached by neither     : 2

a second checker who also read the docs adds : 0
a checker who searched by shape added        : 4
```

Identical overall totals, four defects each reaches that the other cannot.

```
classes no searcher reached
  ['aliasing']
  of those, named in the docs : 0
```

Nothing is declared: each searcher is a rule over a defect's class, and recall
is computed separately for named and unnamed classes. The second doc-led checker
is a **separate rule**, not the same function compared against itself — that
comparison would print 0 regardless of what the code did.

Handing a new checker the documentation is the fastest way to make them useful
and the fastest way to give them the builder's blind spots. Both happen in the
same afternoon and only one of them is visible.

Verify it yourself:

```bash
pnpm eml run examples/the-checker-inherits-the-builders-vocabulary/the_checker_inherits_the_builders_vocabulary.eml
```
