# Inherited permission after move — the cache refreshes on write, and a move is not a write

`inherited_permission_after_move.eml` moves four documents between folders and
compares, for every (user, action) pair, the grants cached on the document
against the grants its current folder actually gives.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: inherited permissions are expensive to resolve, so the
resolved answer is stored on the document. The invalidation rule that gets
written is "recompute on write", because writing is when the document is in
hand. A move is not a write to the document — it is a write to its parent link,
one column in a different row.

| doc | from | to | disagreements | over-permissive | under |
| --- | --- | --- | --- | --- | --- |
| d1 | public | restricted | 4 | **4** | 0 |
| d2 | team | legal | 6 | **4** | 2 |
| d3 | restricted | public | 4 | 0 | 4 |
| d4 | legal | team | 6 | 2 | 4 |

32 pairs compared: 10 where the cache grants access the folder does not, 10
where it withholds access the folder gives. Three of the four users hold 3
grants their document's current folder no longer gives; the fourth holds 1.

The staleness has a **direction**, and the direction is decided by what people
use moves for — scored here from the folders' grant-set sizes rather than from
their names:

```
d1  narrowing (5 grants -> 1)
d2  narrowing (4 grants -> 2)
d3  widening  (1 grants -> 5)
d4  widening  (2 grants -> 4)
```

The over-permissive grants come overwhelmingly from the *narrowing* moves —
which is the move an archivist makes when tidying something sensitive away. The
under-permissive half generates a support ticket within a day; the
over-permissive half generates nothing.

One ordinary edit to each document clears the whole over-permissive set
(**0** remaining), which proves the refresh rule works and that the only defect
is which operations reach it. So the documents with the stalest permissions are
exactly the ones nobody has edited since the move — which is what an archive
*is*.

Verify it yourself:

```bash
pnpm eml run examples/inherited-permission-after-move/inherited_permission_after_move.eml
```
