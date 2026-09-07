# The sandbox blocked the network and the lookup was the channel

`the_sandbox_blocked_the_network_and_the_lookup_was_the_channel.eml` - The build sandbox denies outbound network by default, the denial is asserted by a test rather than assumed, and it caught two dependencies calling home. What remains reachable is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The sandbox is real isolation. Egress is denied by default rather than by a blocklist, so a destination nobody thought of is denied too; the denial is asserted by a test in the build that fails if a connection succeeds, so a misconfiguration is loud; it applies to every build rather than to release builds; and it caught two dependencies that were quietly contacting their own servers during installation.

Name resolution is not denied, because the build has to resolve the internal package registry. A resolver query carries a name, and a name is bytes the caller chooses.

A build makes forty-one thousand of them.

```
allowed outbound destinations   : 0
allowed resolvers               : 1
destinations reachable          : 1
egress tests asserting a failure: 1
dependencies caught calling home: 2
```

```
bytes a resolver query can carry: 253
resolver queries a build makes  : 41000
  bytes that path can emit      : 10373000
monitoring on the names queried : 0
payload bytes the egress test measures : 0
```

```
the egress policy
  default : deny, not a blocklist
  so a destination nobody thought of : denied
  asserted by : a test that fails if a connection
    succeeds
  applies to : every build, not release builds
  dependencies it caught calling home : 2
  verdict : NO CONNECTIONS LEAVE
```

```
  deny by default plus an asserting test is the strong
  form of this control and both halves are present
```

```
name resolution
  denied : no, and it cannot be; the build resolves the
    internal registry
  what a query contains : a name the caller chose
  who receives it : the resolver, and then whatever
    authority owns the suffix
  is that a connection the egress test sees : no; it is a
    lookup, on a different path
  bytes per query : 253
```

```
  the policy is about connections and a lookup carries
  bytes without being one
```

```
the exception
  why it exists : the build resolves the internal
    registry
  could it be an address instead : it would break on
    every failover
  is failover a real event : yes, with a procedure
  so removing the exception : is not the fix
  resolvers allowed : 1
  destinations allowed : 0
```

```
the egress test
  what it does : opens a connection to a public address
  what it asserts : that the connection fails
  does it pass : yes, every build
  what it measures about the resolver : 
    0 bytes
  would it notice a query for an unusual name : no; it
    tests connections
  names queried per build : 41000
```

```
the two that were caught
  what they did : opened a connection during install
  were they caught : yes, immediately, by the deny
  what that establishes : the control works against the
    thing it controls
  what it does not establish : that nothing left, only
    that no connection did
  monitoring that would separate those : 
    0
```

```
null control - the resolver answers one suffix, and logs
  outbound destinations allowed : 0, unchanged
  monitoring on names queried : 1
  bytes emittable through the resolver : 
    0
  the egress policy did not get stricter; the exception it
  had to make stopped being unbounded
```

```
what a default-deny egress policy guarantees
  no connection leaves the sandbox : exactly, asserted by
    a failing test, and it caught 2 real cases
  no data leaves the sandbox : not addressed; the policy
    is stated over connections and the exception it must
    make carries bytes of its own
```

```
a boundary is defined by the operation it names; every
exception a working boundary is forced to make is a channel
whose capacity is a property of the exception rather than of
the policy, and it is not smaller for being unintended
```

Egress is deny by default rather than a blocklist, asserted by a test that fails if a connection succeeds, on every build, and it caught 2 dependencies calling home. Name resolution stays open because the registry is resolved by name, so of 1 reachable destinations 0 are connections, and 41000 lookups a build can carry 10373000 bytes past 0 monitoring.

Verify it yourself:

```bash
pnpm eml run examples/the-sandbox-blocked-the-network-and-the-lookup-was-the-channel/the_sandbox_blocked_the_network_and_the_lookup_was_the_channel.eml
```
