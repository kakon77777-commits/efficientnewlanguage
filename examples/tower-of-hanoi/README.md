# Tower of Hanoi

`tower_of_hanoi.eml` solves the classic Tower of Hanoi puzzle for 3 disks,
moving them from peg `A` to peg `C` using peg `B` as auxiliary.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: multi-call self-recursion — `hanoi` calls itself
*twice* per invocation (once before, once after recording the current
disk's move), a deeper recursion shape than the corpus's earlier
single-recursive-call cases
([`examples/factorial-recursive/`](../factorial-recursive/),
[`examples/euclidean-gcd-recursive/`](../euclidean-gcd-recursive/)). Each
call returns its own list of moves, combined by the caller via list `+` —
deliberately not a shared mutable move-list, since EML has no `.append()`
and mutating a module-level list from inside a recursive function would
shadow it locally anyway (the same as real Python without a `global`
declaration).

Verify it yourself:

```bash
pnpm eml transpile examples/tower-of-hanoi/tower_of_hanoi.eml   # -> Python
pnpm eml run examples/tower-of-hanoi/tower_of_hanoi.eml         # -> 7 moves + total
pnpm eml trace examples/tower-of-hanoi/tower_of_hanoi.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/tower-of-hanoi/tower_of_hanoi.eml   # -> OK (fixpoint)
```
