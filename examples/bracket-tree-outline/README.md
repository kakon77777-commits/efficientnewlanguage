# Bracket tree: the round trip is the proof

`bracket_tree_outline.eml` parses a bracketed string into a tree, renders
it as an indented outline, and serialises it back.

**What it exercises**: recursive parsing with a cursor threaded through
a one-element list — EML has no reference parameters, so a list is the
smallest mutable box available.

```
root[alpha[one,two],beta[three[deep[deeper]],four],gamma]
```

A renderer alone proves nothing: an outline is just text, and a tree
that lost a branch still produces a perfectly well-formed outline of
what is left. So all three witnesses are derived from the **input
string**, not from the tree: re-serialising must reproduce the input
exactly; the node count must match a count of separators in the raw
text; the deepest indentation must match the raw bracket depth. Three
unclosed inputs must raise.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 12 lines)

```
depth from tree: 4, from raw text: 4, rendered: 4

Unclosed input must raise:
  root[a     -> unclosed bracket at 6
  root[a[b]  -> unclosed bracket at 9
  root[a,b   -> unclosed bracket at 8

The tree is exactly the input: round-trips, counts, and depths agree.

An outline is only evidence about the outline. Serialising back to the
original grammar and comparing strings is what makes a dropped branch
impossible to miss - a missing subtree still renders beautifully.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`bracket_tree_outline.trace.jsonl` beside this file is the recorded execution.
