# The same invoice, in floats and in cents

`money_in_cents.eml` totals one invoice twice — in floating-point
dollars and in integer cents — and reconciles both against a bank that
only accepts whole cents.

**What it exercises**: `0.1 + 0.2` is `0.30000000000000004`, because
tenths are no more representable in binary than a third is in decimal.
Everyone knows this and it still ships, because one line item is fine,
ten line items are fine, and the error only surfaces when something
downstream demands that the parts equal the whole.

The run below shows the interesting outcome: the rounded totals **do**
agree, so a naive reconciliation passes — while three of six line items
were never exact, and the float total misses the true one by
`-3.55e-15`. The program attributes the drift line by line rather than
just observing it.

The lesson is not that floats are broken. It is that a total needing a
round to match was already wrong, and the round is hiding it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

float total  == exact total?  False
float total  - exact total =  -3.552713678800501e-15

Per-line residue (float line total minus its exact value):
  widget: 5.551115123125783e-17
  grommet: 1.1102230246251565e-16
  shim: 5.551115123125783e-17

lines that drift: 3/6

Rounding rescues the total; the individual lines were never exact.

The lesson is not that floats are broken. It is that a total which needs
a round() to match is a total that was already wrong, and the round is
hiding it. Cents are integers; integers here are exact at any size.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`money_in_cents.trace.jsonl` beside this file is the recorded execution.
