# Sorting by a partial order

`partial_order_trap.eml` — runs the same sort over the same sets in two input orders.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: what a comparison-based sort does when the comparison is only partial.

Numbers are totally ordered; sets are not. A sort written against a partial
order still terminates and still returns something — an arbitrary arrangement
of the incomparable elements, decided by arrival order. Nothing raises.

The program prints both results so the arbitrariness is visible rather than
argued. If you need a stable ranking, sort by something total, such as size.

Verify it yourself:

```bash
pnpm eml run examples/partial-order-trap/partial_order_trap.eml
pnpm eml trace examples/partial-order-trap/partial_order_trap.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/partial-order-trap/partial_order_trap.eml   # -> OK (fixpoint)
```
