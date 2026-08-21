# The team is on the fast network

`the_team_is_on_the_fast_network.eml` - Every latency measurement the team takes is honest. What population it describes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Measuring locally is right and it is what makes iteration possible. The numbers are real, the profiler is not lying, and a change that makes the local number better usually makes the remote one better too. Nobody is fooling themselves about the measurement.

The team and the users are two populations that never share a device or a network. Every developer measurement is taken from one of them, and the distribution of the other is not smaller or noisier - it is somewhere else.

Both distributions are computed over the same page.

```
segments : 5 (one of them is the team, with 0% of users)
```

```
segment            users   network   render   total
  the team   0%     4        40      44
  office broadband   22%     30        60      90
  home broadband   34%     60        90      150
  good mobile   28%     140        180      320
  poor mobile   16%     420        340      760
```

```
the team's measurement : 44 ms, and it is correct
```

```
the same page, weighted by where users actually are
  user-weighted mean : 282 ms
  which is 64 tenths of the team's figure
```

```
  the slowest segment : poor mobile at 760 ms
```

```
users over a 1000 ms budget : 0%
  nobody, on this page
```

```
users over a 500 ms budget : 16%
  and the team is 11 times inside it, so this threshold never fires locally
```

```
a change that removes 300 KB of payload
  measured by the team : 20 ms faster, on 44
  on poor mobile       : 200 ms faster
  the local measurement understates it by 10 times, so the change
  looks marginal to the person deciding whether to ship it
```

```
a change that adds a synchronous call before render
  measured by the team : 4 ms, a rounding error
  on poor mobile       : 420 ms, one more round trip
  the same code, and the two populations disagree about whether it is free
```

```
what makes the other population visible
  field measurement from real sessions : the distribution, not a number
  a throttled profile locally          : one point on it, chosen by hand
  the second is cheap and is a guess about which segment matters; the first
  is the segments themselves
```

```
control - an internal tool the team itself uses daily
  the team's share of the user population : large
  local measurement : a sample of the real distribution
  here the instinct that produced the problem above is simply correct
```

Every local measurement is accurate and the profiler is not lying. It is a measurement of a population the team is the only member of, and the users are in a different one.

Verify it yourself:

```bash
pnpm eml run examples/the-team-is-on-the-fast-network/the_team_is_on_the_fast_network.eml
```
