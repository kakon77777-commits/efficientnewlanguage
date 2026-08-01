# Ring buffer: telling a bad read from a bad write

`ring_buffer_bounds_report.eml` is a fixed-capacity ring buffer whose
error handler tells reads and writes apart **by reading the message**.

**What it exercises**: an `IndexError` is not one error. CPython says

```
list index out of range              for  xs[9]
list assignment index out of range   for  xs[9] = 1
```

and the difference is the whole diagnosis: a bad read means the caller
asked for something never written; a bad write means the caller believes
the buffer is bigger than it is. Same exception class, same line number,
opposite bug.

**Until 2026-08-01 this interpreter used the read wording for both** —
invisible to anything that checks only the exception *type*, and
immediately visible to a program that prints `str(e)`, which is to say
any program that logs its errors.

The buffer drives four out-of-range accesses, two of each kind, and
classifies each one from its message alone. Counting is not enough: the
check also confirms each diagnosis matches what that probe actually did,
so reads and writes cannot be swapped and still pass.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (first 20 lines)

```
capacity: 4, slots: [0, 0, 0, 0]
after legal writes: [11, 22, 0, 99]
ring.get(2) = 0
ring.get(-2) = 0

Out-of-range probes:
  read at 4 -> list index out of range
      diagnosed as: read out of bounds
  write at 4 -> list assignment index out of range
      diagnosed as: write out of bounds
  read at -9 -> list index out of range
      diagnosed as: read out of bounds
  write at 7 -> list assignment index out of range
      diagnosed as: write out of bounds

probes:        4
read faults:   2
write faults:  2
unclassified:  0

```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`ring_buffer_bounds_report.trace.jsonl` beside this file is the recorded execution.
