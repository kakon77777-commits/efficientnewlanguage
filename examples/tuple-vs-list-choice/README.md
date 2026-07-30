# Tuple or list?

`tuple_vs_list_choice.eml` states the rule and demonstrates both halves of
it in one program.

```
A LIST is a collection that GROWS.      Its length is DATA.
A TUPLE is a record with a FIXED SHAPE. Its length is TYPE.
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the same sequence builtins applied to both, side by
side, plus the type distinction that survives identical contents.

```
readings is a list, now 5 long: [3, 9, 4, 12, 7]
A point always has 2 parts.
  len(readings)=5   len(p)=2
  sum(readings)=35  sum(p)=10
  readings[1:3]=[9, 4]
  [1, 2] == [1, 2] -> True
  (1, 2) == (1, 2) -> True
  a list and a tuple are different types, so they never compare equal
```

The practical test is one question: **would appending still make sense?**

- Another reading is normal — the count is part of what you are recording.
  That is a list.
- A third coordinate on a 2-D point is not a longer point, it is a
  different kind of thing. That is a tuple.

Both are sequences, so `len`, `sum`, `max`, indexing and slicing work on
either. That shared surface is exactly why the distinction has to be made
on intent rather than on capability.

Verify it yourself:

```bash
pnpm eml run examples/tuple-vs-list-choice/tuple_vs_list_choice.eml
pnpm eml trace examples/tuple-vs-list-choice/tuple_vs_list_choice.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/tuple-vs-list-choice/tuple_vs_list_choice.eml   # -> OK (fixpoint)
```
