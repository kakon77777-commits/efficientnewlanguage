# Graph BFS traversal

`graph_bfs_traversal.eml` visits a small directed graph breadth-first from
node `A`, reaching all 6 nodes in order `A, B, C, D, E, F`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's **first graph algorithm**, and its
first adjacency-dict structure (node -> list of neighbors). Two idioms
worth noting:

- The queue is a plain list with a moving `head` index, not a real
  dequeue — EML has no `.pop(0)`, and rebuilding the list by slice each
  step would turn an O(1) dequeue into O(n).
- Visited-tracking uses the dict-as-set idiom (`node => True` plus an `in`
  membership check), the same approach as
  [`examples/duplicate-remover/`](../duplicate-remover/), since real
  `set()` construction is interpreter-deferred.

The graph deliberately contains a back edge (`F -> A`) so the visited
check is genuinely load-bearing: without it the traversal would loop
forever.

Verify it yourself:

```bash
pnpm eml transpile examples/graph-bfs-traversal/graph_bfs_traversal.eml   # -> Python
pnpm eml run examples/graph-bfs-traversal/graph_bfs_traversal.eml         # -> graph, BFS order, node count
pnpm eml trace examples/graph-bfs-traversal/graph_bfs_traversal.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/graph-bfs-traversal/graph_bfs_traversal.eml   # -> OK (fixpoint)
```
