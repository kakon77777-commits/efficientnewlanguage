# Temperature alert system

`temperature_alert_system.eml` classifies a day's worth of hourly Celsius
readings from a weather station into "cold"/"mild"/"hot" bands, prints a
per-reading alert line (flagging severe extremes), and tallies how many
readings landed in each band.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `and`/`or`/`not` boolean logic composed from plain
threshold comparisons (`is_mild` from two `not`s joined with `and`;
`is_severe` from two comparisons joined with `or`), an `if`/`elif`/`else`
chain with a `^+` tally counter augmented in each branch, a `?:` ternary,
and `%`-style string formatting with a tuple right-hand side
(`"%d ... %s (%s)" % (temp, category, flag)`) for both the per-reading line
and the closing summary line.

**A real round-trip bug found and worked around while authoring this
case**: the first draft bound each reading's `(temp, category, flag)` tuple
to an intermediate variable (`(temp, category, flag) => info`) before
formatting with it. `eml roundtrip` failed: the reverse transpiler
(`@eml/transpiler-eml`) treats a bare tuple literal as an "inline literal"
eligible for the `name^+<literal>` declare shorthand (same class as
`x^+[1, 2, 3]`), emitting `info^+(temp, category, flag)` — but the forward
parser's `^+` only has a dedicated fast path for a `[`-bracketed list
literal after `^+`, not a `(`-bracketed tuple; it falls back to treating
`identifier^+(...)` as a plain call, silently discarding the assignment
(`python2` came back as a bare `info(temp, category, flag)` expression
statement, not `info = (...)`). The fix was to stop naming the tuple at
all and inline it directly as the `%` operator's right-hand side instead —
a tuple that is never the sole/first value bound to a fresh identifier
never reaches that reverse-transpiler heuristic. Not something this
program needed to route around by design; a real, reproducible gap between
`@eml/transpiler-eml` and the forward parser for tuple literals
specifically, worth fixing upstream but out of scope for a case-corpus
entry.

Verify it yourself:

```bash
pnpm eml transpile examples/temperature-alert-system/temperature_alert_system.eml   # -> Python
pnpm eml run examples/temperature-alert-system/temperature_alert_system.eml         # -> per-reading alerts + tally
pnpm eml trace examples/temperature-alert-system/temperature_alert_system.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/temperature-alert-system/temperature_alert_system.eml   # -> OK (fixpoint)
```
