# The id survived the hop and the type did not

`the_id_survived_the_hop_and_the_type_did_not.eml` - Identifiers go out as numbers and come back as numbers. How many of them come back as the same number is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Sending an id as a number is the right encoding when the id is a number. It is smaller than a string, it sorts correctly, it needs no quoting, and every system in the chain agrees that the field holds an integer.

One hop in the chain stores numbers as doubles, which hold every integer exactly up to a point and round beyond it. Below that point the round trip is exact and the chain is correct; above it, two different ids can arrive as the same number.

The boundary is computed rather than looked up, and every id is run over it.

```
integers a double holds exactly : up to 9007199254740992
```

```
id            value                out of the hop        unchanged
  legacy   41235   41235   yes
  current   900719925474099   900719925474099   yes
  at the limit   9007199254740992   9007199254740992   yes
  limit plus 1   9007199254740993   9007199254740992   NO 
  limit plus 3   9007199254740995   9007199254740996   NO 
  twice over   18014398509481985   18014398509481984   NO 
```

```
ids that survive the hop unchanged : 3 of 6
```

```
  at the limit and limit plus 1 are different ids and arrive as 9007199254740992
distinct ids that collide after the hop : 1
  a lookup by the received id returns one record for two requests, and
  nothing in the chain reports an error
```

```
the boundary against real id ranges
  ids below the limit : 3, exact
  ids above           : 3
  the limit is 9007199254740992, which is 16 digits, and an id generator
  that emits 19 digits crosses it on its first value
```

```
a suite whose fixtures use ids like 41235
  round trips exactly : yes
  proves the chain preserves ids : only for ids under the limit
  every fixture below the limit passes whatever the hop does above it
```

```
the same ids sent as strings
  values a string holds exactly : all of them, at any length
  cost : the field sorts as text, so ordering must be done on the number
  the boundary moves from the value to the sort, where it is visible
```

```
control - the same ids through a chain that keeps integers
  such a chain applies no conversion, so there is nothing to measure: the
  value written is the value read, at every magnitude
  ids above the limit in this set : 3, every one of which would be
  unchanged, so a chain like that cannot show the difference between the
  two encodings
```

Every hop agrees the field holds an integer and every hop is right. One of them holds integers up to a size, and the ids grew past it without any schema changing.

Verify it yourself:

```bash
pnpm eml run examples/the-id-survived-the-hop-and-the-type-did-not/the_id_survived_the_hop_and_the_type_did_not.eml
```
