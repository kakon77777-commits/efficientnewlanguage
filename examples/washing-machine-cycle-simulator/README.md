# Washing machine cycle simulator

`washing_machine_cycle_simulator.eml` steps a washing machine through its
fixed cycle (`fill -> wash -> rinse -> spin -> done`), each stage with its
own duration, accumulating a running total.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a multi-stage cyclic state machine driven by
parallel `stages`/`durations` lists indexed by a loop counter — a different
shape from the corpus's other simulators: 2-state and event-driven in
[`examples/turnstile-simulator/`](../turnstile-simulator/), position-
tracking in [`examples/elevator-simulator/`](../elevator-simulator/), and a
fixed linear sequence of named stages here.

Verify it yourself:

```bash
pnpm eml transpile examples/washing-machine-cycle-simulator/washing_machine_cycle_simulator.eml   # -> Python
pnpm eml run examples/washing-machine-cycle-simulator/washing_machine_cycle_simulator.eml         # -> per-stage lines + total
pnpm eml trace examples/washing-machine-cycle-simulator/washing_machine_cycle_simulator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/washing-machine-cycle-simulator/washing_machine_cycle_simulator.eml   # -> OK (fixpoint)
```
