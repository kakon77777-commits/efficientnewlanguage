# The unspecified order became the contract

`the_unspecified_order_became_the_contract.eml` - The documentation says the order is unspecified. Seven of nine callers depend on it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The doc is not wrong and was not neglected: leaving the order unspecified was a deliberate choice that kept the implementation free. Anyone who read that sentence was told exactly what they could rely on.

What every caller saw instead was a stable order, every time they ran it, for years. Reading the doc tells you the order is not promised; running the code tells you what the order is, and only one of those two is available at three in the morning when something has to ship.

Which callers break is computed by running each one against both orders.

```
callers : 9
  break if the order changes : 7
  survive                    : 2
```

```
caller                who breaks
  report builder   BREAKS
  csv export   BREAKS
  cache key builder   BREAKS
  ui list   BREAKS
  audit log   fine
  sum totals   fine
  diff tool   BREAKS
  fixture loader   BREAKS
  search index   BREAKS
```

```
how the survivors survive
  they sort first        : 1
  they never read positions : 1
```

```
what a caller can learn, and from where
  the documentation : the order is unspecified
  running the code  : the order is this exact sequence
  which one is checkable at write time : the second
  which one is a promise               : the first
```

```
changing the order
  callers that must change : 7 of 9
  the change is permitted by every word of the contract
```

```
keeping the order
  callers that must change : 0
  the freedom the doc reserved : now unusable in practice
```

```
if the order had been deliberately varied from the start
  callers that would have failed immediately : 7
  callers that would have failed later       : 0
  the same callers, discovered at write time instead of at change time
```

```
control - a list whose order the contract does promise
  callers depending on it : 2 of 2
  and they are entitled to
```

The sentence in the documentation is true and was read. What callers build against is what they can observe, and an unspecified behaviour that never varies is indistinguishable from a promise.

Verify it yourself:

```bash
pnpm eml run examples/the-unspecified-order-became-the-contract/the_unspecified_order_became_the_contract.eml
```
