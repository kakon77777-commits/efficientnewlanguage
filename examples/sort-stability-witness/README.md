# Sorted is not the same as stable

`sort_stability_witness.eml` runs two insertion sorts that differ by one character, verifies both sort correctly, and shows only one of them is usable.

**What it exercises**: the standard way to sort by two fields is to sort
twice - by name, then by department. That works if and only if the sort
is stable. With an unstable sort the second pass scrambles the first,
and the result is still perfectly ordered by department, so it passes
every "is it sorted?" check while the names inside each department are
arbitrary.

Stability is `>` versus `>=` in the inner guard. Both versions sort
correctly on all 81 arrangements swept - an order check cannot tell them
apart **at all**. The difference is visible only in the original index,
which the comparison never looks at, and that is why the tag has to be
carried through the sort rather than inferred afterwards.

The case also pinned down an EML-P fact the hard way: `rows => out`
binds the same list, it does not copy. Insertion sort writes through its
indices, so the first version mutated its own input and the second sort
silently received the output of the first.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

stable keeps names ordered within dept:   True
unstable keeps names ordered within dept: False

arrangements swept:        81
stable version   sorted:   81/81
stable version   stable:   81/81
unstable version sorted:   81/81
unstable version stable:   0/81

Both sort correctly on every arrangement; only one preserves ties.

Both versions are sorted in 81/81 arrangements - an order check
cannot tell them apart at all. The difference appears only in the original
tags, which the comparison never looked at, and that is the whole reason
the tag has to be carried through the sort rather than inferred after it.
```
