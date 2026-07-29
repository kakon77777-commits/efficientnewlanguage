# A receipt, and what `%` rounding actually does

`receipt_formatter.eml` is the smallest honest excuse to use every part of
`%`-formatting at once: left-aligned names, right-aligned integers,
fixed two-decimal money, and a percentage.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

```
ITEM                 QTY    PRICE     TOTAL
------------------------------------------
Coffee beans 1kg       2    18.50     37.00
Filter papers          1     3.25      3.25
Mug                    3     7.00     21.00
Gift card              1    25.00     25.00
------------------------------------------
subtotal               7              86.25
tax                          8.0%      6.90
TOTAL                                 93.15
```

## This case could not have been written before

EML's interpreter supported only bare `%s`, `%d` and `%f`. The moment a
program asked for `%.2f`, `%5d` or `%-12s` it raised
`ValueError: unsupported format character` **in the browser**, while the
transpiled Python printed the right thing. Since `%.2f` is simply how you
write money, that made most real formatting a divergence rather than a
feature.

## The rounding is the interesting part

`%`-formatting rounds the **exact binary value**, ties to even. Both
halves of that matter, and the program prints both:

```
  1.005 -> 1.00   (the double is 1.00499999..., so it rounds DOWN)
  0.125 -> 0.12   (exactly representable, a true tie, so it goes to EVEN)
  2.675 -> 2.67   (again below the decimal you typed)
  2.5   -> 2     and 3.5 -> 4   (both to the even neighbour)
```

Those lines look inconsistent and are not:

- An implementation that rounds **the decimal you typed** rather than the
  double you got disagrees on `1.005` and `2.675`. (`Intl` with
  `roundingMode: 'halfEven'` does exactly this.)
- An implementation that rounds **ties away from zero** disagrees on
  `0.125` and `2.5`. (JavaScript's `toFixed` does exactly this.)

Neither built-in was usable, so the interpreter does the arithmetic in
BigInt off the IEEE-754 bits. `tests/percent-format.test.ts` pins it
against CPython across 66,000 spec/value combinations.

Verify it yourself:

```bash
pnpm eml transpile examples/receipt-formatter/receipt_formatter.eml
pnpm eml run examples/receipt-formatter/receipt_formatter.eml         # -> the receipt + the rounding table
pnpm eml trace examples/receipt-formatter/receipt_formatter.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/receipt-formatter/receipt_formatter.eml   # -> OK (fixpoint)
```
