# The not-found sentinel meets negative indexing — a miss returns the last row

`not_found_sentinel_meets_negative_indexing.eml` runs six lookups against a
four-row table under a guarded and an unguarded call style.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `-1` for "not found" is a fine convention, and the first
caller uses it correctly by checking before using. The second does what looks
like the same thing in one fewer line — `xs[find_index(xs, t)]` — and in Python
that is not an error. Index `-1` is the last element.

```
  table   : ['alpha', 'beta', 'gamma', 'delta']
  alpha -> guarded alpha | unguarded alpha
  gamma -> guarded gamma | unguarded gamma
  epsilon -> guarded NOT-FOUND | unguarded delta
  zeta -> guarded NOT-FOUND | unguarded delta
  delta -> guarded delta | unguarded delta
  beta -> guarded beta | unguarded beta

queries that miss                          : 2 of 6
misses that came back as the LAST element  : 2
```

**Nothing downstream can reject the wrong answer**, because it is a real row:

```
  unguarded results that are NOT a member of the table: 0
  a validity check on the result cannot separate a hit from a miss
```

**The collision, which is what makes the fixture problem structural:**

```
queries whose unguarded answer is the last element, 'delta'
  present : ['delta']
  missing : ['epsilon', 'zeta']
  distinct queries collapsing to one answer: 3
```

Four of the six queries produce identical answers under both call styles — all
four because the item is present. A fixture built from items that are present
can never fail. And asserting that the **last** item looks up correctly is the
one assertion a miss also satisfies, so it carries no information about misses
at all.

**A claim removed rather than shipped.** The first version of this file closed
by asserting that a fixture for the last item also cannot fail — and the
section meant to demonstrate it printed nothing, because `delta` is present and
landed in the other bucket. The claim was true in spirit and unsupported by the
run. It was replaced with the collision measurement above, which shows the
three distinct queries actually mapping to one answer.

Verify it yourself:

```bash
pnpm eml run examples/not-found-sentinel-meets-negative-indexing/not_found_sentinel_meets_negative_indexing.eml
```
