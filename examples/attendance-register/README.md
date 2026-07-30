# Updating a key does not move it

`attendance_register.eml` keeps an attendance dict as instance state on a
class, updated one mark at a time.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict living across many small mutations rather
than built in one pass, `in` guarding a counter update, and the ordering
property that only shows up under repeated updates.

```
name   days
-----  ----
chen   3
ana    2
brit   1
dev    1

Total marks via the register: 7 (matches 7: True)
```

The log is `chen, ana, brit, chen, dev, ana, chen` — deliberately not
alphabetical, with repeats. The report proves two things at once:

- Order is **insertion** order, so `chen` leads.
- A key's position is fixed when it is **first inserted** and does not
  change when it is **updated**. `chen` was also marked last, and did not
  move to the end.

That is easy to assume either way, which is exactly why it deserves a
program rather than a sentence.

Verify it yourself:

```bash
pnpm eml run examples/attendance-register/attendance_register.eml
pnpm eml trace examples/attendance-register/attendance_register.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/attendance-register/attendance_register.eml   # -> OK (fixpoint)
```
