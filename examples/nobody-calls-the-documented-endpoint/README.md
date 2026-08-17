# Nobody calls the documented endpoint

`nobody_calls_the_documented_endpoint.eml` - The documented endpoint carries 3% of the traffic. The one nobody wrote down carries most of it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The documented one is better in every way it was designed to be: versioned, validated, rate-limited, and the only one with a stability guarantee. It was announced, it has a tutorial, and it is the one the team maintains.

The other one exists because the web client needs it, and the web client is public, so its requests are visible to anyone who opens a browser console. Nothing was leaked; it was simply observable, and observable beats documented when someone needs to ship today.

Traffic and guarantees are counted per endpoint, so which one is load-bearing is measured rather than assumed.

```
endpoints : 4
```

```
endpoint                  documented   calls/day   callers
  /api/v2/orders   yes        300      4
  /internal/orders.json   no         6200      19
  /api/v2/customers   yes        210      3
  /_next/data/orders   no         2400      11
```

```
documented endpoints
  calls   : 510  (5%)
  callers : 7  (18%)
```

```
undocumented endpoints
  calls   : 8600  (94%)
  callers : 30  (81%)
```

```
changing the documented endpoint
  callers affected : 7
  they were told it is versioned, so a v3 costs them a migration they expect
```

```
changing the undocumented one
  callers affected : 30
  they were told nothing, so they find out when it breaks
```

```
share of traffic that is versioned, validated and rate-limited
  5%
  the other 95% has none of those, and is most of the load
```

```
if the observed endpoint were documented tomorrow
  traffic moved : 0
  callers who become announceable : 30
  guarantees the team then owes : the ones it already effectively provides
```

```
control - a service where the documented path carries the traffic
  documented share : 99%
  here the contract and the load are the same surface
```

The documented endpoint is better and is maintained. Callers build against what they can see working, and a public client makes its own requests visible to everyone who reads them.

Verify it yourself:

```bash
pnpm eml run examples/nobody-calls-the-documented-endpoint/nobody_calls_the_documented_endpoint.eml
```
