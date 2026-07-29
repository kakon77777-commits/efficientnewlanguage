# Dictionaries as the primary structure

`dict_inventory_report.eml` builds an inventory around a dict — seven
corpus programs used a dict literal, none of them centrally.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: EML has dict literals, subscript read and write,
`in` membership, and `len`. It does **not** have `.keys()`, `.values()`,
`.items()`, `.get()` or iteration over a dict — so a program that needs
an ordered walk keeps its own key list alongside. That is a real
constraint, and the case is built around it rather than pretending
otherwise.

```
  widget     12 x   2.50 =    30.00
  ...
  widget   rejected: only 20 in stock, asked for 30
  sprocket rejected: unknown item
  ...
  recorded:   472.25 + -146.50 = 325.75
  recomputed: 325.75
  The running total and the recomputed total agree.
```

**The check at the end is why this is a case and not a demo.** After the
restocking and selling, the running total is compared against a value
**recomputed from scratch** off the closing dict. A write that landed on
the wrong key would leave both numbers individually plausible but
different from each other; a single self-consistent total would not catch
it.

`in` does the rest of the work: an unknown item is rejected by
membership rather than by a failed lookup, so a typo never silently
creates a new product.

Verify it yourself:

```bash
pnpm eml transpile examples/dict-inventory-report/dict_inventory_report.eml
pnpm eml run examples/dict-inventory-report/dict_inventory_report.eml         # -> 3 accepted, 2 rejected, totals agree
pnpm eml trace examples/dict-inventory-report/dict_inventory_report.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/dict-inventory-report/dict_inventory_report.eml   # -> OK (fixpoint)
```
