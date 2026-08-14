# The shared rule ranked worst — 0 of 3 against the strict rule, where three different rules got 2 of 3

`the_shared_rule_ranked_worst.eml` ranks three teams three ways from one ticket log and compares each ranking with a strict rule applied to everybody.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: **This case was written to show the opposite of what it shows.** The argument
it was built to make — the roughness was identical, so the ranking between teams
was informative even though no single number was — is the standard case for
keeping a shared metric rather than letting teams refine their own. The
measurement refuses it on this data, and the honest response was to rename the
case rather than adjust the data until the original title held.


```
team   loose   own precise   one shared precise
  a      5         4              2
  b      4         4              3
  c      5         3              1
```

```
rankings
  a : loose #1, own precise #1, shared precise #2
  b : loose #3, own precise #1, shared precise #1
  c : loose #1, own precise #3, shared precise #3
```

```
agreement of the own-precise ranking
  with the loose ranking   : 1 of 3
  with the shared-precise ranking : 2 of 3
```

```
control - a log with nothing to exclude
  teams where loose and strict give the same number : 3 of 3
  the two rules are the same function here, and the rankings coincide
```

Sameness is what makes numbers addable. It is not by itself what makes a
ranking mean something — and this is a fact about this population, not a law.

Verify it yourself:

```bash
pnpm eml run examples/the-shared-rule-ranked-worst/the_shared_rule_ranked_worst.eml
```
