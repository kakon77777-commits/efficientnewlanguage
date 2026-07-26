# Best single buy/sell profit

`stock_buy_sell_profit.eml` finds the best profit obtainable from buying
once and selling once later, across five price series — e.g.
`[7, 1, 5, 3, 6, 4] -> best profit 5` (buy at 1, sell at 6).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a single pass carrying two running values — the
cheapest price seen so far, and the best profit so far.

This is [`examples/max-subarray-kadane/`](../max-subarray-kadane/) wearing
different clothes: the best profit equals the largest sum of any
contiguous run of the **daily differences**, so the two problems are
formally the same problem. What makes the pair worth having is where they
*stop* being the same:

| | All-negative / all-declining input |
| --- | --- |
| Kadane | must return the least-bad element (`-2`) — a subarray must be non-empty |
| this case | must return `0` — declining to trade is always allowed |

`[7, 6, 4, 3, 1]` and `[3, 3, 3]` are the samples that pin that down. An
implementation that seeded `best` from the first difference instead of
from `0` would return a negative "profit", which is the same bug Kadane
*must not* protect against.

Verify it yourself:

```bash
pnpm eml transpile examples/stock-buy-sell-profit/stock_buy_sell_profit.eml   # -> Python
pnpm eml run examples/stock-buy-sell-profit/stock_buy_sell_profit.eml         # -> 5 "prices -> best profit" lines
pnpm eml trace examples/stock-buy-sell-profit/stock_buy_sell_profit.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/stock-buy-sell-profit/stock_buy_sell_profit.eml   # -> OK (fixpoint)
```
