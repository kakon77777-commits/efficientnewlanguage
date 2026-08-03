# Two right answers to -7 / 2

`integer_division_sign.eml` implements truncating division alongside Python's floor division and checks both against the identity that defines them.

**What it exercises**: `q * b + r == a` holds for both conventions on
every pair — neither is treated as the reference, which is what makes
them both correct. They agree on non-negative inputs and part on the
rest, which is why the mix-up survives every fixture set.

The remainder's sign follows the **divisor** under floor and the
**dividend** under truncation, verified on every non-zero case rather
than asserted.

Where it costs: anything cyclic. A ring index `i % n` is in range for
negative `i` under floor and out of range under truncation. `((i % n) +
n) % n` costs one addition and is correct under either, which is the
reason to write it even in Python.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
1      1     1           1             yes
9      1     1           1             yes
10     2     2           2             yes
11     3     3           3             yes

ring indices probed:                   15
  truncating remainder in range:       12/15
  ((i%n)+n)%n in range:                15/15

checks passed: 5/5
Both conventions satisfy the identity. Only one of them is the one you meant.

Neither answer is a bug. The bug is the assumption that there is only one,
which survives because every test with non-negative inputs passes under
both - and non-negative inputs are what test fixtures are made of. The
guarded wrap costs one addition and removes the question entirely.
```
