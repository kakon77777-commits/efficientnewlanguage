# One flag per incident and no tested combination

`one_flag_per_incident_and_no_tested_combination.eml` - Twelve flags, one per incident, each added by someone who was right. How many live combinations were ever tested is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Every one of these flags is defensible on its own. Each was added during a real incident, by a person who needed exactly that switch, and each shipped with a test proving it does what it says when it is the only thing turned on. Nobody added a flag for fun.

A flag is not a feature, it is a dimension. Twelve of them describe a space, and what runs in production is a set of points in that space chosen by customers and operators rather than by anyone who tests. The number of points is not the number of flags and it is not the size of the space either.

Both are computed here.

```
flags               : 12
combinations the flags allow : 4096
```

```
settings live in production : 23
combinations covered by tests : 7
  live and never tested : 16
  that is the number to act on; 4096 is a bound nobody deploys
```

```
what the per-flag tests establish
  each flag alone, against defaults : 12 of 12
  any two flags together            : 0
  the combination a given tenant runs: only if it is one of the 7
  a flag proven correct alone is proven correct alone
```

```
distance from the default configuration
  average flags switched off : 21 tenths of a flag
  the furthest tenant        : mabry, 6 flags off
  tenants running the default: 3 of 23
  so 20 tenants run something the default test path never executes
```

```
flags still switched off by at least one tenant : 9 of 12
flags nobody has switched off in a year         : 3
  those 3 are removable on the evidence available
```

```
space after removing the unused flags : 512
  down from 4096, a factor of 8
  and the live settings are unchanged at 23
  because removing a flag nobody switched off changes nobody's behaviour
```

```
control - a service with one flag
  combinations allowed : 2, live : 2
  identical, so testing both settings is testing everything that runs
```

Each flag was added by someone who was right, and each is tested alone. What runs is a combination, and no incident ever produced one of those.

Verify it yourself:

```bash
pnpm eml run examples/one-flag-per-incident-and-no-tested-combination/one_flag_per_incident_and_no_tested_combination.eml
```
