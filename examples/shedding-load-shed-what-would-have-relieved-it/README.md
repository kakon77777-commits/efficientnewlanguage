# Shedding load shed what would have relieved it

`shedding_load_shed_what_would_have_relieved_it.eml` - Under overload the requests nobody is waiting on are refused first. What that does to the next interval is simulated rather than assumed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Shedding by who is waiting is the right ranking for the question it answers. Under overload something has to go, and dropping traffic no user is blocked on protects the traffic they are blocked on. Every load-shedding guide says this and it is correct about the interval it is applied in.

Some of that traffic is what keeps the next interval cheap: the request that refills a cache, the drain that keeps a queue short, the probe that keeps a node in the pool. Refusing it saves load now and buys load later, and a ranking by who is waiting does not contain the later term.

Both rankings are run over the same overload.

```
request kinds : 6
offered load with nothing shed : 52
capacity : 40, so 12 must go
intervals : 6
```

```
request        load   cost of refusing   adds to the next interval
  health probe   2      0                  14
  cache refill   6      0                  22
  queue drain   8      0                  18
  report job   12      1                  0
  user read   14      8                  0
  user write   10      14                  0
```

```
ranking                          offered over the run   worst interval   user pain   sheds
  refuse what nobody waits on    582                 106             115           33
  refuse what costs least later  312                  52              6           6
```

```
shedding by who is waiting carried 270 more offered load across the run
  and its worst interval was 54 above the other's
```

```
offered load each interval, refusing what nobody waits on
  interval 1 : offered 52, shed health probe cache refill queue drain 
  interval 2 : offered 106, shed health probe cache refill queue drain report job user read user write 
  interval 3 : offered 106, shed health probe cache refill queue drain report job user read user write 
  interval 4 : offered 106, shed health probe cache refill queue drain report job user read user write 
  interval 5 : offered 106, shed health probe cache refill queue drain report job user read user write 
  interval 6 : offered 106, shed health probe cache refill queue drain report job user read user write 
```

```
offered load each interval, refusing what costs least later
  interval 1 : offered 52, shed report job 
  interval 2 : offered 52, shed report job 
  interval 3 : offered 52, shed report job 
  interval 4 : offered 52, shed report job 
  interval 5 : offered 52, shed report job 
  interval 6 : offered 52, shed report job 
```

```
requests whose refusal costs something later : 3 of 6
  load they occupy now      : 16
  cost of refusing them now : 0
  load they add back later  : 54
  refusing all three frees 16 and returns 54, a net loss of 38
  every one of them costs nothing to refuse, which is exactly why a
  ranking on who is waiting puts them first
```

```
control - three request kinds, none with a later term
  total later cost across all of them : 0
  with no later term, refusing the unwatched traffic is simply correct
  and this overload cannot separate the two rankings
```

Refusing what nobody is waiting on is the right ranking for the interval it is computed in. Being unwatched is also what maintenance traffic looks like, so the sort puts the next interval's cost at the top of the list.

Verify it yourself:

```bash
pnpm eml run examples/shedding-load-shed-what-would-have-relieved-it/shedding_load_shed_what_would_have_relieved_it.eml
```
