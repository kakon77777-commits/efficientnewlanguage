# The hash was salted and the salt was constant

`the_hash_was_salted_and_the_salt_was_constant.eml` - Passwords are salted and stretched with a tuned work factor, and no password is stored. How many users share a stored value is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The hashing is not naive. It is a memory-hard derivation rather than a bare digest, the work factor was measured against the login endpoint's budget and set to two hundred and forty milliseconds, the output is compared in constant time, and a plaintext password has never been written anywhere. Every review of this code has passed it.

A salt's purpose is to make two identical passwords produce two different stored values, so that one precomputed table cannot serve the whole database. It does that by being DIFFERENT PER RECORD.

This salt comes from the configuration file. There is one of it.

```
users                        : 2400000
distinct stored values       : 1780000
sharing a value with someone : 620000
share                        : 2583 per ten thousand
```

```
salts in use                 : 1
work factor, ms              : 240
plaintext passwords stored   : 0
```

```
the derivation
  memory-hard rather than a bare digest : yes
  work factor measured against the endpoint budget : yes
  comparison in constant time : yes
  plaintext written anywhere  : 0
  reviews passed              : all
  verdict                     : PROPERLY HASHED
```

```
  none of that is nominal; the work factor alone is worth
  more than most deployments manage
```

```
the property a salt supplies
  two identical passwords must store differently : that is
    the whole of it
  how it does that : by differing per record
  salts here       : 1, from the configuration
  so two identical passwords store : identically
```

```
  the salt is present, is long, is random, and was
  generated once
```

```
an attacker with the database
  tables needed for a per-record salt : 2400000
  tables needed here                  : 1
  accounts one table serves           : 2400000
  accounts confirmed by one guess     : 41000
```

```
  the work factor still applies to each guess; what is
  gone is having to spend it again for the next account
```

```
users behind the most common stored value : 170 per ten thousand
```

```
reading the code
  a salt is read      : yes
  it is concatenated correctly : yes
  it is long and random : yes
  where it comes from : a configuration value
  is that per record  : the line does not say, and the
    name of the variable is `salt`
```

```
null control - a salt generated per record
  work factor, ms       : 240, unchanged
  distinct stored values: 2400000
  sharing a value       : 0
  tables an attacker needs : 2400000
  the derivation did not get stronger; the salt started
  varying, which is the only thing it was ever for
```

```
what a salted hash guarantees
  the stored value is not the password : exactly
  two accounts with one password differ : not addressed
    unless the salt varies, and a constant salt satisfies
    every other property a salt is described as having
```

```
a salt is defined by its variation, not by its presence;
long, random and correctly concatenated are the properties a
reader checks, and none of them is the one that matters
```

The derivation is memory-hard, tuned to 240 ms, compared in constant time, with 0 plaintext passwords stored anywhere. There is 1 salt, so 620000 users - 2583 per ten thousand - share a stored value with somebody, one precomputed table serves all 2400000 accounts, and a single correct guess confirms 41000 of them at once.

Verify it yourself:

```bash
pnpm eml run examples/the-hash-was-salted-and-the-salt-was-constant/the_hash_was_salted_and_the_salt_was_constant.eml
```
