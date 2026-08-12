# Repairing in the wrong order loses data — a compensating pair cannot be fixed one side at a time

`repairing_in_the_wrong_order_loses_data.eml` runs four deployment sequences
against a writer and a reader that agree on the wrong field name.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the schema says the field is `amount`; both sides say
`amt`. Nothing has ever gone wrong, because the only reader of that field is
the only writer of it. Repairs, however, are deployed one side at a time — that
is not a choice, it is how deployment works.

```
reads served, and records left unreadable, by repair sequence
  reader first
    reads failed : 15 total, 7 of them on records written during the window
    stranded, written during the window : 2
    stranded, predating the migration   : 2
  writer first
    reads failed : 7 total, 3 of them on records written during the window
    stranded, written during the window : 0
    stranded, predating the migration   : 2
  both at once
    reads failed : 8 total, 0 of them on records written during the window
    stranded, written during the window : 0
    stranded, predating the migration   : 2
  dual write then dual read
    reads failed : 4 total, 0 of them on records written during the window
    stranded, written during the window : 0
    stranded, predating the migration   : 2
```

**The separation is what makes this a comparison at all.** Records that predate
the migration are in the old shape in every sequence — that is a backfill,
planned before anyone started:

```
records predating the migration, stranded
  smallest across the four sequences : 2
  largest  across the four sequences : 2
  identical in all four, so this cost belongs to the backfill, not the sequence
```

What the sequence actually decides:

```
sequences that strand records written during the window : 1 of 4
  strands: reader first
sequences that do not : 3

among the sequences that strand nothing new, failed reads range from 4 to 8
  fewest failed reads: dual write then dual read
```

**Two errors of mine are recorded in the file, because its own output corrected
them.** The first version merged pre-existing records with records written
during the window, which made all four sequences look equally bad (0 of 4
clean) and hid the only difference that matters. And the closing line claimed
one sequence avoided both costs while the program printed 0 of 4 — a claim
running one notch ahead of the evidence. Both are noted in the header comment.

Nothing is declared: each sequence is simulated step by step, and the final
readability check uses the *finished* system's reader rather than whatever was
running at the time.

**Why it closes this round.** The other four cases here are about a
compensating pair sitting undetected —
[two-defects-cancel-in-the-round-trip](../two-defects-cancel-in-the-round-trip/),
[two-off-by-ones-preserve-the-count](../two-off-by-ones-preserve-the-count/),
[over-invalidation-hides-a-broken-cache-key](../over-invalidation-hides-a-broken-cache-key/),
[the-safety-net-is-load-bearing](../the-safety-net-is-load-bearing/). This one
is what happens when you finally try to take one apart: the safest route is to
hold *both* mistakes at once, deliberately, for exactly as long as it takes to
get out.

Verify it yourself:

```bash
pnpm eml run examples/repairing-in-the-wrong-order-loses-data/repairing_in_the_wrong_order_loses_data.eml
```
