# Door lock keypad simulator

`door_lock_keypad_simulator.eml` simulates a keypad door lock through a
fixed sequence of 6 PIN attempts, ending in a lockout.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a 3-state machine (`locked`/`unlocked`/`alarm`)
with a wrong-attempt counter that resets on any correct entry and trips
into `alarm` after 3 consecutive failures — richer than the corpus's
2-state [`examples/turnstile-simulator/`](../turnstile-simulator/). Once in
`alarm`, further input is deliberately ignored rather than modeled with a
separate reset event, keeping the toy model simple.

Verify it yourself:

```bash
pnpm eml transpile examples/door-lock-keypad-simulator/door_lock_keypad_simulator.eml   # -> Python
pnpm eml run examples/door-lock-keypad-simulator/door_lock_keypad_simulator.eml         # -> per-attempt lines, ending in alarm
pnpm eml trace examples/door-lock-keypad-simulator/door_lock_keypad_simulator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/door-lock-keypad-simulator/door_lock_keypad_simulator.eml   # -> OK (fixpoint)
```
