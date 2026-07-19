# Shopping cart total

`shopping_cart_total.eml` models a shopping cart as a list of `(item_name,
unit_price, quantity)` tuples and prints an itemized receipt with a grand
total — one of a seven-case self-authored batch of list/collection
utilities for the EML case corpus (see
[`examples/list-statistics/`](../list-statistics/),
[`examples/duplicate-remover/`](../duplicate-remover/),
[`examples/list-rotator/`](../list-rotator/),
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/),
[`examples/intersection-union-finder/`](../intersection-union-finder/), and
[`examples/second-largest-finder/`](../second-largest-finder/) for the
other six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuple literals and tuple subscript access
(`entry[0]`/`entry[1]`/`entry[2]`) inside a `for` loop, a `def`/`return`
helper function (`format_money`) to avoid repeating rounding logic per line,
and `%`-string formatting (`"%s x%d = $%s" % (name, qty, price_str)`).
`"%.2f" % (x,)` was tried first, exactly as the obvious approach — it works
fine under real Python, but `eml trace --run` caught that the interpreter's
own `%`-formatter throws `ValueError: unsupported format character '.'`
(precision specs aren't modeled), which would silently defer the
equivalence check. So amounts are rounded to the nearest cent by hand
(`int(x * 100 + 0.5)`) and rendered as a zero-padded "dollars.cents" string
via plain `%s`/`%d` — confirmed to matter with a `$0.50 x 6` line item,
whose subtotal is an exact `$3.00` and would otherwise print as `$3.0`
without the manual zero-pad.

Verify it yourself:

```bash
pnpm eml transpile examples/shopping-cart-total/shopping_cart_total.eml   # -> Python
pnpm eml run examples/shopping-cart-total/shopping_cart_total.eml         # -> itemized receipt
pnpm eml trace examples/shopping-cart-total/shopping_cart_total.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/shopping-cart-total/shopping_cart_total.eml   # -> OK (fixpoint)
```
