# Binary search tree

`binary_search_tree.eml` inserts `[50, 30, 70, 20, 40, 60, 80, 35]` into a
BST, then walks it in-order to recover `[20, 30, 35, 40, 50, 60, 70, 80]` —
the tree's defining property, demonstrated rather than asserted.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's **first tree structure**, plus
recursive in-order traversal (recurse left, emit, recurse right).

The tree is three parallel lists indexed by node number — `values`,
`lefts`, `rights`, with `-1` meaning "no child" — rather than linked node
objects. That is a deliberate representation choice: it keeps every write
a single-level subscript assignment (`new_index => lefts[current]`), which
is the shape EML's assignment targets model directly, instead of relying
on a chain like `nodes[current][1]`.

Pairs with [`examples/graph-bfs-traversal/`](../graph-bfs-traversal/) and
[`examples/graph-dfs-recursive/`](../graph-dfs-recursive/) as the corpus's
linked-structure cases.

Verify it yourself:

```bash
pnpm eml transpile examples/binary-search-tree/binary_search_tree.eml   # -> Python
pnpm eml run examples/binary-search-tree/binary_search_tree.eml         # -> insert order, in-order walk, root/children
pnpm eml trace examples/binary-search-tree/binary_search_tree.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/binary-search-tree/binary_search_tree.eml   # -> OK (fixpoint)
```
