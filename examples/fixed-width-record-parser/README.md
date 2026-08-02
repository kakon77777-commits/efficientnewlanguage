# Fixed-width records: where clamping does the most damage

`fixed_width_record_parser.eml` parses column-offset records — the format in which a truncated line and a valid line are indistinguishable after the slices have run.

**What it exercises**: fixed-width is still everywhere — bank
statements, mainframe exports, legacy EDI — and a parser for it is
three slices:

```
id      columns  0..6
name    columns  6..26
amount  columns 26..36
```

If a line is short — trailing spaces stripped by an editor, a truncated
transfer, a last line without a newline — every slice past the end
returns `""` instead of raising. **The record parses. The fields are
wrong. Nothing says so.**

The run shows `"A1005"` — five characters against a 36-column schema —
yielding `['A1005', '', '']`: right shape, right field count, no error
attached. The only thing distinguishing it from a real record is its
length, and that must be checked **before** the slices, because
afterwards the evidence is gone.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 14 lines)

```
accepted:            3
rejected:            3
accepted + rejected: 6
sound records:       3/3
total amount:        474.7
damaged lines the unchecked parser accepted: 3

Every line accounted for; the length check caught what slicing could not.

Line 5 is 'A1005' - five characters against a 36-column schema. Sliced
blindly it yields an id and two empty strings, which is a record. It has
the right shape, the right field count, and no error attached to it. The
only thing that distinguishes it from a real record is its length, and
that has to be checked BEFORE the slices, because afterwards it is gone.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`fixed_width_record_parser.trace.jsonl` beside this file is the recorded execution.
