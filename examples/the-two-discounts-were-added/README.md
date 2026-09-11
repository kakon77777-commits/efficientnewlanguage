# The two discounts were added

`the_two_discounts_were_added.eml` - The promotion is "20% off, then 30% off", and each discount is applied correctly. What the two together come to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Each discount is honest on its own. The 20% is 20% of the list price; the 30% is 30% of what it is applied to; both are applied, neither is skipped; and the register logs each step. The advertised headline adds them: 50% off.

Discounts compose by multiplication, not by addition.

```
list price                      : 10000 cents
first discount                  : 2000 per ten thousand
second discount                 : 3000 per ten thousand
advertised (added)              : 5000 per ten thousand
```

```
promised price (added)          : 5000 cents
price after the first           : 8000 cents
price after the second          : 5600 cents
true discount                   : 4400 per ten thousand
overcharge against the headline : 600 cents
```

```
the two discounts, applied
  the first : 20 percent of the list price
  the second : 30 percent of what it is applied to
  either one skipped : no
  each step : logged by the register
  discounts correctly applied : both
  verdict : BOTH HONORED
```

```
  applying the second to the already-reduced price is the
  part done correctly here, and it is why neither discount
  is in dispute
```

```
the headline, 50 percent off
  how it was formed : the two rates, added
  what adding rates assumes : a common base for both
  the second discount's actual base : the reduced price,
    not the list
  so 20 then 30 : is 4400 per ten thousand, not 5000
  the gap : the 30 percent is taken on 8000,
    not on 10000
```

```
the customer at the register
  what the headline promised : 5000 cents
  what the register charges : 5600 cents
  the difference : 600 cents
  is either discount wrong : no; each is exact on its
    own base
  the true saving : 4400 per ten thousand off
```

```
null control - compose the discounts, do not add them
  added headline : 5000, unchanged
  composed discount : 4400 per ten thousand
  prices that changed : 0
  no discount and no base changed; only the way the two
  were combined into one headline did
```

```
what two honored discounts guarantee
  each was applied to its stated base : exactly, 20 on
    the list and 30 on the reduced price, both logged
  the customer got 50 percent off : not addressed;
    discounts compose by multiplication not addition, so
    20 then 30 is 4400 per ten thousand off - the headline
    promised 5000 and the register charged 5600
```

```
a percentage is taken of a base, and two percentages with different bases do
not add; stacking them multiplies the remainders, so the second cut is smaller
in dollars than its rate suggests
```

Each discount is exact on its own base and both are applied - nothing is skipped. The headline adds them to 50 percent, but they compose to 4400 per ten thousand: the register charges 5600 cents where the headline promised 5000, a gap of 600 cents.

Verify it yourself:

```bash
pnpm eml run examples/the-two-discounts-were-added/the_two_discounts_were_added.eml
```
