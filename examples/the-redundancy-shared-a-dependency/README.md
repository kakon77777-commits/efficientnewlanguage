# The redundancy shared a dependency

`the_redundancy_shared_a_dependency.eml` - The service runs in three availability zones. Each zone is measured at 99.9 percent. The availability the three of them actually provide is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Three zones is the right architecture and the reasoning behind it is sound. Zones fail independently by design: separate power, separate cooling, separate network, and the provider contracts on exactly that independence. Three is the smallest number that survives one loss and still holds a quorum. The 99.9 per zone is not a marketing figure either - it was measured over a year of real operation.

Independent failures multiply. Every zone fetches its TLS certificate from one internal certificate authority at startup and on renewal. That authority was never part of the availability calculation because it is not a zone; it is a small internal service that had never gone down.

A product of independent terms is only as independent as its least independent term. Adding a fourth zone, or a tenth, moves the product term and leaves the shared term exactly where it is.

```
zones                    : 3
per-zone unavailability  : 1 per mille, i.e. 99.9 percent
shared CA unavailability : 5 per ten thousand, i.e. 99.95 percent
```

```
all three zones down at once, zones treated as independent
  probability : 1 in 1000000000
  expected downtime from that cause : 0 seconds per year
  which rounds to zero on any dashboard
```

```
the certificate authority, which all three zones call
  unavailability : 5 per ten thousand
  expected downtime : 262 minutes per year
  during which all three zones are up and none of them can serve
```

```
downtime attributable to
  three zones failing together : less than 1 second per year
  the one shared dependency    : 262 minutes per year
  the second is larger than the first by a factor no dashboard shows,
  because the first was the only one that was ever computed
```

```
zones   independent term          shared term       total downtime/yr
  1     525 min                 262 min           787 min
  2     31 sec                  262 min           262 min
  3     under a second         262 min           262 min
  4     under a second         262 min           262 min
  5     under a second         262 min           262 min
  6     under a second         262 min           262 min
```

```
  from two zones onward the answer stops changing
  every zone after the second costs money and buys nothing measurable
```

```
questions the design review asked
  are the zones independent            yes, contractually
  does the service survive one zone    yes, demonstrated
  does it survive two zones            yes, demonstrated
  is there anything all three call     not asked
```

```
  the first three questions are about the term that was already negligible
  the fourth is about the term that is the entire answer
```

```
control - the zone-failure drill, which passed
  zones killed in the drill : 1
  service stayed up         : yes
  zones killed             : 2
  service stayed up         : yes
  what the drill would show if the CA were also killed : not run
  the drill exercises the independent term and is silent on the other
  a drill that kills a zone cannot find a dependency shared BY zones
```

```
null control - the same three zones, certificate cached per zone
  shared dependency at request time : none
  downtime from three zones failing : under a second per year
  downtime from the CA              : 0 minutes, requests do not reach it
  total                             : under a second per year
  the architecture is unchanged; one call moved off the request path
  so the finding is not 'three zones is wrong'
  it is 'a product of independent terms is worth exactly as much as its
  least independent term'
```

```
how to find the term that is missing from an availability product
  list the components               done, three zones
  multiply their failure rates      done, and it is negligible
  list what EVERY component calls   this is the missing step
  a dependency shared by all N does not appear in any per-component review
  and it is not reduced by raising N
```

Zones fail independently by contract, three is the smallest number that holds a quorum after one loss, and the 99.9 was measured over a real year. The three-zone term contributes under a second of downtime a year. The one service all three call contributes 262 minutes, it was never in the calculation because it is not a zone, and a fourth zone would not have changed it by a single second.

Verify it yourself:

```bash
pnpm eml run examples/the-redundancy-shared-a-dependency/the_redundancy_shared_a_dependency.eml
```
