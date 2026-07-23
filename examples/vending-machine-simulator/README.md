# Vending machine simulator

`vending_machine_simulator.eml` simulates a vending machine processing four
fixed purchases against a small product catalog (Soda 150, Chips 200,
Candy 100, Water 125, in arbitrary currency units) — each purchase inserts a
list of coins, accumulates a balance, and either dispenses the item with
change or reports the shortfall.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two parallel lists standing in for a product catalog
(no dict-of-dict or class needed), a lookup function (`find_price`), a
second function (`vend`) called purely for its side effect (`vend(...)` as a
bare statement, same pattern as
[`examples/phase2-cold-hot/square_sum.eml`](../phase2-cold-hot/)'s
`greet(total)`), and `if`/`else` branching on the accumulated balance.

Verify it yourself:

```bash
pnpm eml transpile examples/vending-machine-simulator/vending_machine_simulator.eml   # -> Python
pnpm eml run examples/vending-machine-simulator/vending_machine_simulator.eml         # -> 4 dispense/shortfall lines
pnpm eml trace examples/vending-machine-simulator/vending_machine_simulator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/vending-machine-simulator/vending_machine_simulator.eml   # -> OK (fixpoint)
```
