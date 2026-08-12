# One fact counted as three sources — 4 systems agree, 2 origins exist

`one_fact_counted_as_three_sources.eml` traces each system's answer back to
where it came from and counts distinct origins rather than distinct systems.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a reviewer queries five systems and gets four agreeing
answers plus one outlier. Nobody lied and nothing was duplicated by mistake —
copying a value into the system that needs it is correct engineering.

```
  systems reporting 4200 : 4
  systems reporting else : 1

provenance
  master -> master  (0 hops)
  billing -> master  (1 hops)
  reporting -> master  (2 hops)
  audit -> audit  (0 hops)
  support -> master  (3 hops)
  distinct origins across 5 systems : 2

one vote per origin
  origins reporting 4200 : 1
  origins reporting else : 1
```

Four-to-one becomes one-to-one. And the outlier is the one that is right:

```
  systems that match the true value : 1 of 5
```

**Correcting the origin does not fix the count:**

```
after correcting the master record
  systems still reporting 4200 : 3
  systems matching the truth   : 2
```

```
systems with no upstream, which are the only ones that can carry news
  master reports 4200
  audit reports 4190
  total: 2 of 5
```

Nothing is declared: provenance is followed link by link and origins are
counted from where the chain terminates.

An agreement rate is evidence only when the things agreeing were able to
disagree. Four of these five could not, and the one that could is the one the
reviewer treated as the outlier.

**Related.** [the-majority-is-three-copies](../the-majority-is-three-copies/)
asks the same question about *implementations*; this one asks it about a
*value*, where the copying is not only defensible but correct.

Verify it yourself:

```bash
pnpm eml run examples/one-fact-counted-as-three-sources/one_fact_counted_as_three_sources.eml
```
