# The inventory was built from the agents that checked in

`the_inventory_was_built_from_the_agents_that_checked_in.eml` - The asset inventory refreshes hourly from a reporting agent, shows full agent coverage, and found forty-one unpatched hosts. Where its host list comes from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The inventory is a working one. It refreshes hourly rather than quarterly, so it is not a spreadsheet; the data is what the host reports about itself rather than what a purchase order said; it is complete per host, carrying package versions rather than a name and an owner; and it earns its place by finding things, including forty-one hosts missing a patch that was believed fully rolled out.

A host appears in the inventory when its agent reports. A host the agent never reached is not an entry with a gap; it is not an entry.

The provider's own instance list has five hundred and ten more.

```
hosts in the inventory          : 4100
  with the agent reporting      : 4100
agent coverage reported         : 10000 per ten thousand
refresh interval, hours         : 1
unpatched hosts it found        : 41
```

```
instances in the provider list  : 4610
  absent from the inventory     : 510
  share absent                  : 1106 per ten thousand
jobs that diff the two lists    : 0
```

```
the asset inventory
  refresh : hourly, not quarterly
  source of the data : what the host reports about
    itself, not a purchase order
  detail per host : package versions, not a name and an
    owner
  what it found : 41 hosts missing a patch believed
    fully rolled out
  verdict : ACCURATE PER HOST
```

```
  hourly self-reported package versions is a real
  inventory and it is why the 41 were found
```

```
membership
  a host appears when : its agent reports
  a host with a failing agent : appears, stale, and that
    is visible
  a host that never had the agent : does not appear
  what it looks like : nothing; there is no row to be
    stale
  instances like that : 510
```

```
  the list is complete over the hosts that report and
  reporting is the condition for being on it
```

```
the coverage metric
  numerator : hosts with the agent reporting
  denominator : hosts in the inventory
  where the inventory came from : hosts with the agent
    reporting
  so the ratio : 10000 per ten thousand, necessarily
  could it ever be lower : only if a reporting agent were
    excluded from the list it defines
  what it therefore measures : nothing that can vary
```

```
the absent instances
  launched from an older image : some
  in an account the deploy role cannot reach : some
  living less than the 1-hour refresh : some
  is any of that misconduct : no
  which of them would a patch report mention : none
  jobs comparing the two lists : 0
```

```
null control - enumerate from the provider, diff against here
  detail per host : unchanged
  jobs diffing the two lists : 1
  hosts the inventory can see : 4610
  instances absent : 0
  the agent did not improve; the population stopped being
  defined by the instrument that measures it
```

```
what an agent-reported inventory guarantees
  every reporting host is described accurately and
    recently : exactly, hourly, in detail
  every host is described : not addressed; the list is
    assembled from arrivals, and a host that never
    arrives is not late
```

```
an enumeration built from self-reports has a population
defined by its own instrument, so its coverage metric is a
tautology and the only number that can contradict it has to
come from somewhere else entirely
```

The inventory refreshes hourly from what each host reports about itself, down to package versions, and found 41 hosts missing a patch believed rolled out. A host is on it because its agent reported, so coverage reads 10000 per ten thousand of a list that agents define, while the provider's own console lists 4610 instances - 510 absent, 1106 per ten thousand - and 0 jobs compare them.

Verify it yourself:

```bash
pnpm eml run examples/the-inventory-was-built-from-the-agents-that-checked-in/the_inventory_was_built_from_the_agents_that_checked_in.eml
```
