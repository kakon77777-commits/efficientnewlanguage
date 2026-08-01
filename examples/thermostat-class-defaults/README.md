# Thermostats: a factory default shared until it is overridden

`thermostat_class_defaults.eml` models the shape every settings object
has — a default on the **class**, a per-object override on the
**instance** — and checks that the boundary between them holds.

**What it exercises**: reading an attribute falls back from instance to
class; writing one only ever touches the instance. Get that backwards
and adjusting one device silently reconfigures the whole fleet.

**Until 2026-08-01 this program could not be written here at all.** A
class body in EML ran only its `def`s, so `class Thermostat: 20 =>
target` bound the class and threw the assignment away; `self.target`
then raised `AttributeError` as if the line had never existed. The class
body now runs once in a namespace of its own, and that namespace becomes
the class attributes — which is what Python does.

The five checks:

1. adjusting the nursery did not move the other two — **sampled while
   the class default was still 20**, because after it drops to 18 a
   correct instance-local write and an incorrect write-through both
   read 18, and the check would pass either way
2. the nursery keeps what its owner set
3. the un-adjusted units follow the new class default, so the fallback
   is a live lookup and not a value copied at construction time
4. every unit still reads the class-level unit string
5. the class attribute is readable off the class itself

Writing to the class (`18 => Thermostat.target`) was the *other* half of
the fix, and it was missing at first. Nothing failed — the trace simply
recorded `interp deferred: write .target` and produced no equivalence
event. An honest deferral is what surfaced it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 14 lines)

```
  hall -> idle
  nursery -> HEAT
  cellar -> idle

After the factory default drops to 18:
  hall: target 18C +/-2
  nursery: target 23C +/-1
  cellar: target 18C +/-2

checks passed: 5/5
Instance writes stay local; class writes reach only the un-adjusted.
Check 1 is the one that matters. A settings object that writes through to
the class looks correct for a single device and reconfigures every other
device the moment a second one exists.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`thermostat_class_defaults.trace.jsonl` beside this file is the recorded execution.
