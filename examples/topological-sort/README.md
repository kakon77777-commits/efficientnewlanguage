# Topological sort (Kahn's algorithm)

`topological_sort.eml` orders a course-prerequisite graph so every
prerequisite comes before whatever needs it, then runs the same function
against a deliberately impossible cyclic graph.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's third graph algorithm, after
[`examples/graph-bfs-traversal/`](../graph-bfs-traversal/) and
[`examples/graph-dfs-recursive/`](../graph-dfs-recursive/) — and the first
one that computes an *ordering* rather than a *reachability walk*. Counts
how many edges point at each node (in-degree), repeatedly takes a node
nothing points at, and decrements its neighbors.

The cycle case is the point worth keeping. A topological order only exists
for a graph with no cycles, and Kahn's algorithm detects that **for free**:
if the queue drains before every node has been emitted, the leftovers are
exactly the nodes trapped in a cycle. The `a -> b -> c -> a` sample emits
nothing at all, because every node is waiting on another — no extra
cycle-detection pass needed.

Node names are passed in as an explicit list rather than read off the
dict, so iteration order is fixed by the program instead of by dict
internals.

Verify it yourself:

```bash
pnpm eml transpile examples/topological-sort/topological_sort.eml   # -> Python
pnpm eml run examples/topological-sort/topological_sort.eml         # -> a valid course order, then a detected cycle
pnpm eml trace examples/topological-sort/topological_sort.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/topological-sort/topological_sort.eml   # -> OK (fixpoint)
```
