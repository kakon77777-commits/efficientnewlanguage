# The invariant held over an empty collection

`the_invariant_held_over_an_empty_collection.eml` - The property test asserts that every open position nets to within the risk limit, and it has passed on every run for the quarter. How many positions it quantifies over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The test is careful. It checks the real position book, not a fixture; the assertion is a genuine universal over every position; a single breach fails the run; and it runs before each trading session.

On the runs under review the position book loaded empty, and a universal over an empty collection is true with nothing to check.

```
sessions this quarter           : 62
  the book loaded empty         : 18
  with a real book              : 44
positions that breached (as seen): 0
reported pass                   : 100 per hundred
breaches on the empty-load days : 9
empty-load share                : 2903 per ten thousand
```

```
the risk property test
  checks : the real position book, not a fixture
  assertion : every position nets within the limit
  a breach : fails the run
  runs : before each trading session
  positions seen to breach : 0
  verdict : PROPERTY HELD
```

```
  a genuine universal over the real book rather than a
  fixture is the part done right here, and it is why a
  real breach in a loaded book would fail
```

```
'every open position is within the limit'
  positions on an empty-load day : 0
  a for-all over zero positions : true, nothing to check
  what 'the property held' means there : the book was
    empty, not that risk was in bounds
  what it does not mean : that the real positions were
    within the limit
```

```
the empty load
  why : the position feed timed out and the loader
    returned an empty book rather than erroring
  sessions affected : 18
  breaches that actually existed those days : 
    9
  did the passing test see them : no; they were not in
    the empty collection it quantified over
  is the pass false : no; it is vacuously true
```

```
null control - require a non-empty book first
  pass when empty is vacuous : 100
  pass when empty is a failed precondition : 
    0
  sessions a non-empty assertion would flag : 
    18
  no position changed; an empty book stopped satisfying a
  property about the positions in it
```

```
what a passing risk property guarantees
  every position in the book is within the limit :
    exactly, a genuine universal, a breach fails the run
  risk was within the limit : not addressed; the book
    loaded empty, and a for-all over an empty collection is
    true with nothing to check - 9 real breaches on the
    18 empty-load days were never quantified over
```

```
a universal is satisfied by an empty domain, and an empty domain is what a
failed load looks like; 'every position is safe' is true precisely when there
are no positions to be unsafe, which is when the book did not load
```

It asserts a real universal over the actual book and fails on a breach - held all quarter. The book loaded empty on 18 sessions, where a for-all is vacuously true, so 9 real breaches went unseen, 2903 per ten thousand of sessions checking nothing.

Verify it yourself:

```bash
pnpm eml run examples/the-invariant-held-over-an-empty-collection/the_invariant_held_over_an_empty_collection.eml
```
