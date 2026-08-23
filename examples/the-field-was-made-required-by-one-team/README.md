# The field was made required by one team

`the_field_was_made_required_by_one_team.eml` - A producer added one required field to a shared event. What that cost the producer and what it cost everybody else are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The field should be required. It carries the tenant id, half the downstream bugs that quarter came from events that could not be attributed to a tenant, and making it optional would have meant every consumer writing the same defensive branch. The producer is right on the merits and the review approved it in an afternoon.

The producer's cost is one line and one deploy. The consumers' cost is a migration each, and the number of consumers is not a number the producer's change had to state anywhere. A change is approved against the cost visible in the change.

Both costs are counted below.

```
the change            : one field, from optional to required
producer effort       : 1 day
consumers of the event: 6
consumer effort       : 17 days
ratio                 : 17 to 1
```

```
consumer          records/day   parser    days to migrate   days until noticed
  billing   900000     strict     3                 0
  search index   400000     lenient     1                 4
  fraud   120000     strict     5                 0
  data warehouse   900000     strict     4                 1
  partner export   40000     lenient     2                 9
  mobile sync   300000     strict     2                 0
```

```
what happened at the deploy
  consumers that rejected the event outright : 4 of 6
  consumers that kept running on the old shape : 2
    broke  : billing (900000 records a day stopped)
    broke  : fraud (120000 records a day stopped)
    broke  : data warehouse (900000 records a day stopped)
    broke  : mobile sync (300000 records a day stopped)
    survived: search index, and carried a null tenant for 4 days
    survived: partner export, and carried a null tenant for 9 days
  the lenient parsers did not break, which is why they noticed last
```

```
records affected on day one
  rejected outright : 2220000 a day
  accepted with no tenant, across the days before anyone looked : 1960000
  the first number produced pages, the second produced rows
```

```
the producer's own suite at the moment of the change
  tests over the producer's code : green
  tests over the event contract  : green, the field is now required
  consumers exercised by that suite : 0
  a producer's suite tests what the producer does with the event, and the
  cost of this change is entirely in what other people do with it
```

```
how long each consumer ran wrong before anyone knew
  longest lag : partner export at 9 days
  its volume  : 40000 records a day
  which is the smallest of the 6, and the least watched
  average lag across all consumers : 2 days
  the lag is longest where the volume is lowest, because a consumer is
  noticed when it is missed
```

```
the same field, required after a two-release window
  producer effort : 2 days, one extra deploy
  consumer effort : 17 days, unchanged
  consumers broken at any moment : 0
  records rejected : 0
  the total work is 19 days against 18, so the window costs
  one producer day and removes every rejected record
```

```
control - a required field on internal audit trail, consumers outside the team: 0
  producer effort : 1 day
  consumer effort : 0 days
  ratio : 1 to 1
  here the person deciding and the person paying are the same person,
  and the review sees the whole cost
```

Requiring the tenant id was the right call and the review was not careless. The cost of a contract change is carried by the contract's consumers, and how many of those there are is not written anywhere in the change.

Verify it yourself:

```bash
pnpm eml run examples/the-field-was-made-required-by-one-team/the_field_was_made_required_by_one_team.eml
```
