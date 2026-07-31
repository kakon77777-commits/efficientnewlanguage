# What you may and may not ask a set

`set_order_discipline.eml` — states the line between order-free and order-dependent set operations.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the full rule, with the refusals shown alongside the things that work.

A set has no defined order. CPython still prints one — its hash order — and
that is neither insertion nor sorted order. This interpreter cannot reproduce
it, so anything that would EXPOSE an order defers: iterating a set, printing
one with two or more elements, summing a set of floats.

Everything order-free still works, and that is most of what a set is for.
The rule: **use a set to answer a question, use a list to produce a sequence.**

Verify it yourself:

```bash
pnpm eml run examples/set-order-discipline/set_order_discipline.eml
pnpm eml trace examples/set-order-discipline/set_order_discipline.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/set-order-discipline/set_order_discipline.eml   # -> OK (fixpoint)
```
