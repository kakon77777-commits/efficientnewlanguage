# Linked list operations

`linked_list_operations.eml` builds a four-node singly linked list, prints
it, reverses it in place, and prints it again — showing the internal link
array before and after.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: index-as-pointer representation — `values` holds
the payloads, `nexts` holds each node's successor index (`-1` for end of
list), plus a `head` index. The same technique as
[`examples/binary-search-tree/`](../binary-search-tree/), with one link
per node instead of two.

The case exists for `reverse_list`: the classic three-pointer walk
(`previous` / `current` / `following`) that re-aims every link backwards
in a single pass with no allocation. The output makes what it actually did
visible:

```
head index 0, nexts [1, 2, 3, -1]     <- before
head index 3, nexts [-1, 0, 1, 2]     <- after
values untouched: ['alpha', 'beta', 'gamma', 'delta']
```

Nothing moved. Only the links changed direction — which is the whole point
of the algorithm, and hard to *see* in a version that just prints the
resulting sequence.

Note the split in what each function returns: `reverse_list` mutates
`nexts` in place and returns only the new head, because that is the one
thing the caller cannot recompute. `append_node` has to return all three
of `values`/`nexts`/`head`, because growing the two lists rebinds them
rather than mutating in place.

Verify it yourself:

```bash
pnpm eml transpile examples/linked-list-operations/linked_list_operations.eml   # -> Python
pnpm eml run examples/linked-list-operations/linked_list_operations.eml         # -> built list, link array, reversed list
pnpm eml trace examples/linked-list-operations/linked_list_operations.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/linked-list-operations/linked_list_operations.eml   # -> OK (fixpoint)
```
