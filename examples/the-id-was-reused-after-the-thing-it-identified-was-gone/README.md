# The id was reused after the thing it identified was gone

`the_id_was_reused_after_the_thing_it_identified_was_gone.eml` - The audit log holds 20000 references, each one an entity id captured at the time an action was taken. How many of them still name the entity they were written about is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Recycling ids is deliberate and was the right call at the time. The id column is a 32-bit integer in a schema that a dozen external systems parse, so widening it is a coordinated release across teams that do not share a calendar. At the observed creation rate a monotonic sequence exhausts the range, and exhaustion is not a graceful failure. A compact id space also keeps the index small enough to stay in memory, which is worth more than it sounds. The free list was reviewed, and the review was right.

A reference is a promise that a name will still mean what it meant. Deleting an entity breaks that promise loudly: the lookup fails, something logs an error, someone investigates. Recycling the id repairs the lookup and keeps the promise broken.

The audit log is not wrong in the sense of containing bad data. Every id in it was correct when written, and every id in it resolves today. It resolves to a different entity than the one the entry is about.

```
references in the audit log : 20000
entities deleted in 12 months : 6000
entities created in 12 months : 6240
  of those, taking a recycled id: 6000
  of those, taking a fresh id   : 240
```

```
reference resolves   points at the right entity   count
  yes                  yes                        14000
  yes                  no                         6000
  no                   -                          0
```

```
  references that silently name someone else : 6000, 30 percent
  references that fail to resolve            : 0
```

```
integrity check: does every reference resolve
  references checked : 20000
  resolved           : 20000
  failed             : 0
  pass rate          : 100 percent
```

```
  the same check against a store with NO id reuse
    references checked : 20000
    resolved           : 14000
    failed             : 6000, and every failure is a real finding
```

```
  reuse turned 6000 loud failures into 6000 silent wrong answers
  and it raised the pass rate of the integrity check from 70 to 100
```

```
a reviewer spot-checks 100 references by opening each one
  entries that open successfully : 100
  entries that are about a different entity than the id names : 30
  entries that LOOK wrong when opened : 0
  a recycled id names a real, current, well-formed entity
  telling the two apart needs the entity's creation time, which the audit
  entry does not record, because when it was written it did not need to
```

```
what a reference would need to carry to be checkable
  the id                      present
  the entity generation count not present
  the entity creation time    not present
  the time the reference was taken   present
  the last two together are enough: a reference is stale if the entity was
  created after the reference was taken
  one of the two is already there
```

```
control - references to entities that were never deleted
  count            : 14000
  resolve          : 14000
  name the right entity : 14000
  errors           : 0
  70 percent of the log is exactly right, which is why it reads as healthy
```

```
null control - the same recycling policy, no long-lived references
  references held past deletion : 0
  references that silently name someone else : 0
  ids saved by recycling        : 6000
  index kept small, 32-bit column kept, no coordinated release needed
  identical policy, and here it is purely a win
```

```
what deletion and reuse each do to an outstanding reference
  delete only        the lookup fails, loudly, and gets fixed
  delete and reuse   the lookup succeeds and returns a different thing
  the second is cheaper to run and more expensive to be wrong about
  a reference is only as good as the guarantee that the name is not reissued
```

A 32-bit id column parsed by a dozen external systems cannot be widened without a coordinated release, a monotonic sequence exhausts that range, and a compact id space keeps the index in memory. Recycling was the correct decision. 6000 of the 20000 references in the audit log now resolve to an entity that is not the one the entry is about, none of them fail to resolve, and the integrity check that reads every one of them reports 100 percent.

Verify it yourself:

```bash
pnpm eml run examples/the-id-was-reused-after-the-thing-it-identified-was-gone/the_id_was_reused_after_the_thing_it_identified_was_gone.eml
```
