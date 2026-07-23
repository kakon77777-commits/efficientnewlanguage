# Elevator simulator

`elevator_simulator.eml` simulates a single elevator serving a fixed queue
of floor requests (`5, 1, 8, 3`), starting at floor 0 and moving one floor
per step toward its current target.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a state machine tracking a single `current_floor`
variable through a nested `for`/`while`/`if`-`else` structure — no
enum/class, no external scheduler/GUI — the third state-machine/simulation
case in this batch alongside
[`examples/traffic-light-simulator/`](../traffic-light-simulator/) and
[`examples/vending-machine-simulator/`](../vending-machine-simulator/).

Verify it yourself:

```bash
pnpm eml transpile examples/elevator-simulator/elevator_simulator.eml   # -> Python
pnpm eml run examples/elevator-simulator/elevator_simulator.eml         # -> per-floor movement lines
pnpm eml trace examples/elevator-simulator/elevator_simulator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/elevator-simulator/elevator_simulator.eml   # -> OK (fixpoint)
```
