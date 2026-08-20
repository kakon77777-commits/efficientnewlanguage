# The schema allowed it and every consumer assumed otherwise

`the_schema_allowed_it_and_every_consumer_assumed_otherwise.eml` - The field is an array. How many consumers read anything but the first element is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Declaring it as an array was the right call and the reviewers who asked for it were right too. The domain genuinely allows several, a scalar would have to be widened later at a breaking cost, and the schema is an accurate statement of what the producer may send.

Every consumer was written against traffic in which the array had one element, because that is what the producer emitted for two years. Their code is correct for every message they have seen, and the schema is correct about messages nobody has sent yet.

Both the schema's domain and the consumers' assumptions are counted.

```
consumers : 7
  read only the first element : 5
  handle the whole array      : 2
```

```
consumer        reads        on a longer array
  billing   first only   silently uses the first
  search index   first only   silently uses the first
  audit log   all elements stores the whole array
  notifier   first only   silently uses the first
  export   all elements stores the whole array
  fraud check   first only   silently uses the first
  dashboard   first only   silently uses the first
```

```
messages observed : 480000
  with exactly one element : 480000
  with any other length    : 0
  the producer has never once sent a length the consumers cannot handle
```

```
what the schema allows
  minimum length : 0
  maximum length : unbounded
  lengths the consumers are correct for : exactly 1
  so 5 consumers are correct on one length out of the permitted set,
  and that length is the only one that has ever arrived
```

```
if the producer starts sending two elements tomorrow
  consumers that error       : 0
  consumers that change answer silently : 5
  consumers that are unaffected         : 2
  the failure is 5 wrong answers and no alert, because reading
  the first element of a two-element array is a legal operation
```

```
if the producer sends an empty array
  consumers that error : 5, on an index that is not there
  that failure is loud, and it is the one the schema's minimum of 0 predicts
  the empty case fails safely and the many case fails silently, which is
  the opposite of how the two are usually ranked in a review
```

```
where the assumption is written down
  in the schema     : no, it permits any length
  in the consumers  : no, indexing the first element is not a statement
  in the fixtures   : yes, every one has exactly one element
  the fixtures are the only artefact that records what anybody assumed,
  and they record it by example rather than by saying it
```

```
control - the same field declared as a single value
  lengths permitted : 1
  consumers correct for : 1
  the two sets are equal, so no traffic can arrive that the consumers are
  wrong about, and widening it later is a visible breaking change instead
  of a silent one
```

The array declaration is the accurate description of the domain and the consumers are correct for every message ever sent. The set the schema permits and the set the traffic contains have been the same size for two years, and only one of them is a promise.

Verify it yourself:

```bash
pnpm eml run examples/the-schema-allowed-it-and-every-consumer-assumed-otherwise/the_schema_allowed_it_and_every_consumer_assumed_otherwise.eml
```
