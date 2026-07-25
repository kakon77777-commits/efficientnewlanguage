# Graph DFS traversal (recursive)

`graph_dfs_recursive.eml` visits the **same graph** as
[`examples/graph-bfs-traversal/`](../graph-bfs-traversal/) depth-first from
node `A`, so the two orders can be read side by side:

| Traversal | Order |
| --- | --- |
| BFS (queue) | `A, B, C, D, E, F` |
| DFS (recursion) | `A, B, D, E, F, C` |

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: recursion over an adjacency dict, and — the reason
this case is worth reading closely — **two different parameter behaviors
in the same function**:

- `visited` is a dict mutated in place (`True => visited[node]`), so writes
  propagate back to the caller by reference.
- `order` is rebuilt by `+` on every append, which rebinds only the local
  name — so each recursive call must **return** it and the caller must
  reassign (`dfs(...) => order`).

That asymmetry is real Python semantics, not an EML quirk, and it is the
kind of thing a corpus case can demonstrate more clearly than prose.

Verify it yourself:

```bash
pnpm eml transpile examples/graph-dfs-recursive/graph_dfs_recursive.eml   # -> Python
pnpm eml run examples/graph-dfs-recursive/graph_dfs_recursive.eml         # -> graph, DFS order, node count
pnpm eml trace examples/graph-dfs-recursive/graph_dfs_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/graph-dfs-recursive/graph_dfs_recursive.eml   # -> OK (fixpoint)
```
