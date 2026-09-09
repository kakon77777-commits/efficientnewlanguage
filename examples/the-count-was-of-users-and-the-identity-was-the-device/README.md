# The count was of users and the identity was the device

`the_count_was_of_users_and_the_identity_was_the_device.eml` - The daily active user figure is deduplicated, bot-filtered, timezone-corrected and reconciled against billing every month, and it has been computed the same way for thirty-four months. What it counts one of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pipeline is careful. Bot traffic is removed by a classifier that is retrained quarterly and audited by hand; a day is the user's local day rather than the server's; the same identity appearing twice in a day is counted once; and the monthly reconciliation against billing has never drifted more than a few parts in ten thousand.

The identity it deduplicates on is the install. A person with a phone and a laptop is two, and a tablet in a clinic waiting room is one.

```
daily active identities         : 184000
bot identities removed a day    : 9200
months computed the same way    : 34
reconciliations against billing : 34
identities resolved to a person : 0
```

```
identities signed in            : 51000
  distinct people behind them   : 38000
  identities per person         : 13421 per ten thousand
  signed-in share               : 2771 per ten thousand
identities never signed in      : 133000
```

```
shared devices identified       : 620
  people behind them            : 24800
  people per shared device      : 40
```

```
the active-user pipeline
  bots : removed by a classifier retrained quarterly and
    audited by hand, 9200 a day
  a day : the user's local day, not the server's
  an identity seen twice : counted once
  reconciliation against billing : monthly, 34 of them,
    never off by more than a few parts in ten thousand
  verdict : DEDUPLICATED
```

```
  reconciling against billing every month is the part
  almost nobody does, and it is why the deduplication is
  known to work rather than assumed to
```

```
two objects
  what the pipeline deduplicates : the install
  what the sentence says : users
  a person with a phone and a laptop : two
  a tablet in a clinic waiting room : one, shared by
    40
  identities the pipeline resolves to a person : 0
```

```
  deduplication is exact on the object it is given, and
  the object it is given is a device
```

```
where a person can be seen
  identities signed in : 51000
  distinct people behind them : 38000
  so identities per person, here : 13421 per ten
    thousand
  identities never signed in : 133000
  what the same rate would imply for them : 99098
  and in total : 137098
  read as people, the reported figure is : 184000
  distance between the two : 46902
```

```
  that last figure is an extrapolation, not a
  measurement; the signed-in group is the part that could
  be checked and it is the part that chose to sign in
```

```
  and the subtraction only parses because the reported
  figure was read as a count of people; identities minus
  people is not a quantity until somebody equates them,
  which is the error this case is about
```

```
null control - require an account, resolve every identity
  bots removed a day : 9200, unchanged
  identities resolved to a person : 184000
  distinct people a day : 141900
  the deduplication did not improve; it was handed the
  object the sentence had been about all along
```

```
what a clean active-user figure guarantees
  each active install is counted once : exactly, bots
    removed, local days, 34 months of the same method
  each active person is counted once : not addressed;
    the pipeline never holds a person, so it can neither
    merge two devices nor split one
```

```
an exact count of one kind of thing is not an approximate
count of another kind; the error is not noise around the
figure, it is the figure being about something else
```

Bots are removed by an audited classifier, days are local, repeats are merged, and 34 monthly reconciliations against billing agree. The identity is the install, so 51000 signed-in identities stand for 38000 people - 13421 per ten thousand - 620 shared devices stand for 24800, and 0 of the 184000 are resolved to a person.

Verify it yourself:

```bash
pnpm eml run examples/the-count-was-of-users-and-the-identity-was-the-device/the_count_was_of_users_and_the_identity_was_the_device.eml
```
