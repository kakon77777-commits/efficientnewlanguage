# Binary heap (min-heap priority queue)

`binary_heap.eml` pushes `[5, 3, 8, 1, 9, 2, 7]` into a min-heap one at a
time (printing the array after each push, so the heap property is visible)
then drains it, recovering `[1, 2, 3, 5, 7, 8, 9]`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first heap, and its first structure
where **the tree is implicit**. There are no child pointers at all — a
node at index `i` simply has children at `2i+1` and `2i+2`, which is
exactly the information that
[`examples/binary-search-tree/`](../binary-search-tree/) needs two
explicit index lists (`lefts`, `rights`) to express. Two different answers
to "how do you store a tree in a flat list", side by side.

`heap_push` sifts the new value **up** while it beats its parent;
`heap_pop` takes the root and sifts the last element back **down**,
picking the smaller of two children each step. `heap_pop` returns
`[value, heap]` because it genuinely has two things to hand back: the
extracted minimum, and the shrunken heap — shrinking rebuilds the list by
slice, which rebinds the local name rather than mutating in place, so it
cannot propagate by reference the way the sift swaps do.

Verify it yourself:

```bash
pnpm eml transpile examples/binary-heap/binary_heap.eml   # -> Python
pnpm eml run examples/binary-heap/binary_heap.eml         # -> per-push heap arrays, then the drained order
pnpm eml trace examples/binary-heap/binary_heap.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/binary-heap/binary_heap.eml   # -> OK (fixpoint)
```
