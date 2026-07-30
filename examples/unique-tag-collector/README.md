# Sets answer questions; lists produce sequences

`unique_tag_collector.eml` counts distinct tags and demonstrates the one
thing EML-P deliberately **refuses** to do with a set.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `set()`, `len()` over a set, membership, and
order-free aggregation — plus the deferral that keeps the rest honest.

```
Palette size: 3
Is "green" in the palette? True
An empty set() has length 0
sum of {10, 20, 30} = 60  (a total cannot depend on order)
```

## The refusal is the point

CPython iterates a set in **hash order**, not insertion order:

```python
list({3, 1, 2})   # -> [1, 2, 3]
```

This interpreter stores a set in insertion order, so iterating one here
would yield `3, 1, 2` — a different sequence from the Python projection of
the same program. Rather than emit our own order and be quietly wrong,
`for x in <set>` **declines and defers to real Python**.

Everything whose answer cannot depend on order still works: `len`,
membership, `min`, `max`, and `sum` over exact integers. One combination
also defers — `sum()` over a set of **floats** — because float addition is
not associative, so even a total could differ in the last bits.

That line is drawn on purpose. Refusing to answer is a worse user
experience than answering, and a much better one than answering wrongly.

The practical rule, which is good advice in Python too: **use a set to
answer a question, use a list to produce a sequence.** Relying on set
iteration order means relying on something the language never promised.

## Two EML-P idioms worth noting

- `not in` is not a single operator here. Write `not (item in seen)`.
- Lists grow by concatenation, not `.append()`: `seen + [item] => seen`.
  Writing `seen ^+ item` means `seen + item`, which is `list + str` and a
  TypeError.

Verify it yourself:

```bash
pnpm eml run examples/unique-tag-collector/unique_tag_collector.eml
pnpm eml trace examples/unique-tag-collector/unique_tag_collector.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/unique-tag-collector/unique_tag_collector.eml   # -> OK (fixpoint)
```
