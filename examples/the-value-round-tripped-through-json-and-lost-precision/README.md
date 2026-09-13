# The value round tripped through json and lost precision

`the_value_round_tripped_through_json_and_lost_precision.eml` - The account ids survived every hop of the pipeline unchanged, and each hop's check passed. What format carries them between hops is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pipeline is careful with ids. Each hop verifies the id it received is well-formed; ids are never truncated or reformatted deliberately; the transport is logged; and a mismatch between hops raises an error. Same id in, same id out is the contract.

Between two hops the id is a JSON number, and JSON numbers are parsed as float64, which is exact only up to 2^53.

```
ids processed                   : 5000000
  within float range            : 4995800
  above 2^53                    : 4200
  came back changed             : 4200
hops that reformatted on purpose: 0
corrupted share                 : 8 per ten thousand
```

```
one id, through the JSON hop
  in  : 9007199254740993
  out : 9007199254740992
  changed by : 1, silently
```

```
the per-hop check
  verifies : the id received is well-formed
  truncation or reformatting : none, deliberately
  transport : logged
  on a mismatch between hops : raises an error
  deliberate id changes : 0
  verdict : IDS INTACT
```

```
  raising on a mismatch between hops is the part done
  right here, and it is why a dropped or garbled id would
  be caught
```

```
the JSON number between the hops
  how the id crosses : as a JSON number
  how the next hop parses it : as float64
  what float64 represents exactly : integers up to 2^53
  an id above that : rounds to the nearest representable
    value
  9007199254740993 becomes : 9007199254740992
  did any hop reformat it : no; the format did
```

```
the check that did not catch it
  what it compares : the id at one hop to the id at the
    next
  both hops in JSON : both already rounded, so both agree
  what agreement means here : the corruption is upstream
    of both, in the format they share
  ids above 2^53 that came back wrong : 
    4200
  is the id well-formed at each hop : yes; wrong, but
    well-formed
```

```
null control - carry the id as a string
  ids above 2^53 : 4200, unchanged in count
  ids changed when carried as strings : 
    0
  ids now preserved : 4200
  no id and no hop changed; the number that cannot hold
  them stopped being the thing that carries them
```

```
what same-id-in-same-id-out guarantees
  each hop received a well-formed id and passed it on :
    exactly, no deliberate reformatting, mismatches raised
  the id survives the round trip : not addressed; between
    two hops it is a JSON number parsed as float64, and
    4200 ids above 2^53 came back changed - silently,
    because the format cannot represent them
```

```
a value survives a pipeline only in a format that can hold it, and a check
between two hops that share a lossy format compares two already-damaged copies;
the loss is invisible precisely because it is common to both sides
```

Each hop verifies a well-formed id and raises on a mismatch - ids intact by every check. Between two hops the id is a JSON float64, exact only to 2^53, so 4200 ids above it came back changed, 8 per ten thousand, under 0 deliberate reformats.

Verify it yourself:

```bash
pnpm eml run examples/the-value-round-tripped-through-json-and-lost-precision/the_value_round_tripped_through_json_and_lost_precision.eml
```
