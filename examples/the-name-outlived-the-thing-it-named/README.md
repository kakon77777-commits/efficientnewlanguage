# The name outlived the thing it named

`the_name_outlived_the_thing_it_named.eml` - The product was renamed four years ago. Where the old name still is, and what it now means in each place, is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Not renaming everything was right. A rename touches running code, stored data, external contracts and other people's integrations, and the cost of doing all of it at once is far larger than the cost of a stale identifier. Every team that decided to leave a name alone decided correctly.

The word did not stop being used, though. It stayed in the places nobody migrated and it was also given to new things, so it now denotes more than one thing, and which one is meant depends on which file you are reading.

Every occurrence is classified by what it denotes now.

```
occurrences of the old name : 8
distinct things it now denotes : 3
  the original product : 5
  a different subsystem : 2
  the whole company's old name : 1
```

```
place                    denotes                        renameable   external
  the database table   the original product   yes          no 
  the API path   the original product   no           yes
  the metrics prefix   the original product   no           no 
  the internal package   the original product   yes          no 
  the new team's module   a different subsystem   yes          no 
  the config key   the original product   no           yes
  the runbook title   the whole company's old name   yes          no 
  the error code prefix   a different subsystem   no           yes
```

```
safe to rename now : 4 of 8
visible outside the company : 3
```

```
renaming everything that is safe
  occurrences removed : 4
  occurrences remaining : 4
  the word still means more than one thing afterwards, because the ones
  that stay are the ones with external contracts
```

```
pairs of occurrences that mean different things : 17
  a reader who learns the word in one place and applies it in another is
  wrong for 17 of the possible pairings
```

```
what makes a stale name harmless
  being stale        : harmless on its own, it is one dead word
  being reused       : this is the part that costs
  the new team gave the old word to a new subsystem, which is the decision
  that turned a dead name into an ambiguous one
  occurrences that are reuse rather than residue : 2
```

```
control - an old codename that was never reassigned
  occurrences : several, all denoting the same retired thing
  distinct meanings : 1
  a reader who learns it once is right everywhere, which is the property
  the reused name gave up
```

Leaving the name alone was cheaper than renaming and every team that chose it chose correctly. The word was then given to something else, and one word for two things is a different problem from an old word for an old thing.

Verify it yourself:

```bash
pnpm eml run examples/the-name-outlived-the-thing-it-named/the_name_outlived_the_thing_it_named.eml
```
