# Traffic light simulator

`traffic_light_simulator.eml` simulates a traffic light cycling
Red -> Green -> Yellow -> Red over 20 steps, each state held for a fixed
number of steps (Red: 3, Green: 4, Yellow: 1).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a state machine built from two parallel lists (state
names and per-state hold durations) indexed by a manually advanced
`state_index` counter, plus `%` to wrap the index back to `0` — no
enum/class, no external timer/scheduler.

Verify it yourself:

```bash
pnpm eml transpile examples/traffic-light-simulator/traffic_light_simulator.eml   # -> Python
pnpm eml run examples/traffic-light-simulator/traffic_light_simulator.eml         # -> 20 step lines
pnpm eml trace examples/traffic-light-simulator/traffic_light_simulator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/traffic-light-simulator/traffic_light_simulator.eml   # -> OK (fixpoint)
```
