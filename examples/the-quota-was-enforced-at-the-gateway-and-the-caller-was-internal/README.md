# The quota was enforced at the gateway and the caller was internal

`the_quota_was_enforced_at_the_gateway_and_the_caller_was_internal.eml` - Per-tenant quotas are enforced at the gateway with no bypass header and no exempt caller, and they refuse nine thousand four hundred requests a day. Which requests reach the gateway is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The enforcement is genuine. There is no header a caller can set to skip it, no allowlist of exempt clients, and no "internal" flag in the request that the gateway trusts; the counter is in a shared store so it is not per instance; the refusal is a documented status with the tenant's remaining budget in it; and a load test confirms the limit holds under concurrency.

The gateway is a place. Service-to-service calls inside the mesh address each other directly, and the nightly aggregation job calls the same API on a tenant's behalf without leaving the mesh.

Eighteen point four million requests a day take that path.

```
endpoints behind the gateway    : 214
bypass headers it trusts        : 0
exempt callers                  : 0
requests refused per day        : 9400
```

```
requests per day                : 80400000
  through the gateway           : 62000000
  metered                       : 7711 per ten thousand
  internal, direct              : 18400000
  unmetered                     : 2288 per ten thousand
internal services calling directly : 31
quota counted on the internal path : 0
```

```
the quota enforcement
  a header that skips it : 0
  exempt callers         : 0
  an internal flag the gateway trusts : none
  where the counter lives : a shared store, not per
    instance
  what a refusal returns : a documented status with the
    remaining budget in it
  holds under concurrency : confirmed by load test
  requests refused per day : 9400
  verdict : ENFORCED
```

```
  no bypass, no exemption, and a shared counter is the
  strong form; most quota systems fail on the third
```

```
the enforcement point
  what it is : a place requests pass through
  which requests pass through it : the ones addressed to
    it
  how services inside the mesh address each other : 
    directly, by service name
  services doing that : 31
  requests on that path per day : 18400000
  quota counted there : 0
```

```
  the rule has no exceptions and the population it rules
  over is defined by an address
```

```
the aggregation job
  whose data it processes : a tenant's
  why it runs : because that tenant asked for the report
  what it consumes : the resource the quota protects
  which quota it counts against : none
  is it doing anything wrong : no; it calls the API the
    way services in this mesh call each other
  is the gateway wrong : no; it never saw the request
```

```
the nine thousand four hundred
  refused per day : 9400
  correctly : every one
  what they establish : the limit is real and exercised
  what they do not establish : that a tenant's consumption
    is bounded
  share of requests the limit can see : 7711
    per ten thousand
```

```
null control - the count moves to where the work happens
  bypass headers trusted : 0, unchanged
  requests metered per day : 80400000
  unmetered share : 0 per ten thousand
  the quota did not get stricter; it stopped being
  attached to a doorway and started being attached to the
  resource it protects
```

```
what gateway enforcement guarantees
  no request through the gateway exceeds a tenant's
    quota : exactly, with no bypass and no exemption
  no tenant exceeds their quota : not addressed; the
    guarantee is scoped to a path, and consumption is a
    property of the work
```

```
a control placed at an entrance governs what enters there;
the absence of exceptions makes it airtight over its
population and does nothing about the size of that
population, which is decided by routing
```

The quota has 0 bypass headers, 0 exempt callers, a shared counter rather than a per-instance one, and it refuses 9400 requests a day correctly. It is enforced at the gateway, and 31 services call the same API directly inside the mesh, so 18400000 of 80400000 requests a day - 2288 per ten thousand - consume a tenant's resource against 0 counters.

Verify it yourself:

```bash
pnpm eml run examples/the-quota-was-enforced-at-the-gateway-and-the-caller-was-internal/the_quota_was_enforced_at_the_gateway_and_the_caller_was_internal.eml
```
