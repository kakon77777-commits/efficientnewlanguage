# Turnstile simulator

`turnstile_simulator.eml` simulates a subway turnstile through a fixed
sequence of 8 `push`/`coin` events, tracking coins collected and rejected
pushes.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a minimal 2-state machine (`locked`/`unlocked`)
driven by event strings via `if`/`elif`/`else`, with two independent
running counters — a smaller, more textbook-flavored state machine than the
corpus's existing
[`examples/traffic-light-simulator/`](../traffic-light-simulator/),
[`examples/vending-machine-simulator/`](../vending-machine-simulator/), and
[`examples/elevator-simulator/`](../elevator-simulator/).

Verify it yourself:

```bash
pnpm eml transpile examples/turnstile-simulator/turnstile_simulator.eml   # -> Python
pnpm eml run examples/turnstile-simulator/turnstile_simulator.eml         # -> per-event lines + 2 summaries
pnpm eml trace examples/turnstile-simulator/turnstile_simulator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/turnstile-simulator/turnstile_simulator.eml   # -> OK (fixpoint)
```
