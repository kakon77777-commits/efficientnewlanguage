# The changelog listed the merges and a revert is a merge

`the_changelog_listed_the_merges_and_a_revert_is_a_merge.eml` - The changelog is generated from merged pull requests rather than written by hand, so nothing that shipped is missing from it. What "shipped" means to the generator is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Generating it was the right call. A hand-written changelog omits whatever the author forgot, which is reliably the small fix that mattered to one customer; this one is built from the merge commits themselves, groups by the label on the pull request, links each entry to its diff, and it has not missed an entry since it replaced the hand-written file two years ago.

The generator's population is MERGES. A revert is a merge, so a change that shipped and was taken back appears as two entries, and a change that was reverted and re-landed appears as three.

Forty-one of last year's entries describe work that is not in the product.

```
entries last year               : 1240
  describing work in the product: 1199
  describing reverted work      : 41
  share                         : 330 per ten thousand
  marked as reverted            : 0
```

```
years since the hand-written file : 2
entries missed since then         : 0
populations the generator ranges over : 1
generator steps reading the revert relation : 
  0
```

```
the generated changelog
  what a hand-written one omits : whatever the author
    forgot, reliably the small fix one customer needed
  what this is built from : the merge commits themselves
  grouping : by the label on the pull request
  each entry links to : its diff
  entries missed in 2 years : 0
  verdict : NOTHING THAT MERGED IS MISSING
```

```
  building it from the merges rather than from memory is
  the whole improvement, and the zero is real
```

```
the generator's input
  what it enumerates : merges
  what a revert is : a merge
  what a re-land after a revert is : a third merge
  does the generator know which is which : it reads the
    title and the label, not the relation
  steps that read the revert relation : 
    0
  entries describing work that is not there : 
    41
```

```
  the completeness claim is exact and it is a claim about
  merges, which is not the noun in the document's title
```

```
one stale entry
  what it says : this was fixed in this version
  was it merged in that version : yes
  was it reverted before the release : yes
  is there a second entry saying so : yes, worded as a
    change of its own
  do the two link to each other : 
    0 entries carry the relation
  what a reader does with two unrelated lines : reads two
    changes
```

```
the revert itself
  merged openly : yes
  titled as a revert : yes
  present in the changelog : yes, as an entry
  is the generator misreporting it : no
  is either entry false : no
  is their conjunction what a reader takes away : no
```

```
null control - the generator resolves reverts
  entries missed : 0, unchanged
  steps reading the revert relation : 
    1
  entries describing reverted work : 
    0
  entries last year : 1199, down from 1240
  the changelog did not lose anything; the count fell
  because it had been reporting a change and its undoing
  as two changes
```

```
what a generated changelog guarantees
  everything that merged appears : exactly, for 
    2 years, which a hand-written file never managed
  everything that appears is in the product : not
    addressed; the generator enumerates merges and the
    product is a state
```

```
generating a document from an event log makes it complete
over events and silent about their composition; a change and
its reversal are two events and no change at all, and
nothing in the log says which pairs cancel
```

Generating it from the merges rather than by hand is the right call and it has missed 0 entries in 2 years, grouped by label with a link to every diff. Its population is merges and a revert is a merge, so 41 of 1240 entries - 330 per ten thousand - describe work that is not in the product, 0 of them marked as such.

Verify it yourself:

```bash
pnpm eml run examples/the-changelog-listed-the-merges-and-a-revert-is-a-merge/the_changelog_listed_the_merges_and_a_revert_is_a_merge.eml
```
