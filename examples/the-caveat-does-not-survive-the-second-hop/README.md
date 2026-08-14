# The caveat does not survive the second hop — 3 of 3 qualifiers gone, number unchanged

`the_caveat_does_not_survive_the_second_hop.eml` walks one payload through four consumers and asks what is left at each.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "Carry the caveat with the number" is the standard fix, and it works at the
first hop. What it does not survive is a consumer that reshapes the record —
which every consumer does, because each one keeps the fields its own schema
names and the caveat is not in that schema.


```
each hop
  dashboard row : value=59, fields=4
  weekly rollup : value=59, fields=2
  exec summary : value=59, fields=1
  press line : value=59, fields=1
```

```
what each hop can still answer
  dashboard row : 3 of 3
  weekly rollup : 1 of 3
  exec summary : 0 of 3
  press line : 0 of 3
```

```
control - the first hop, whose schema names all four fields
  fields kept : 4 of 4
  nothing is lost where the schema has somewhere to put it
```

Attaching the caveat is a fix at the boundary you can see. Past the first
reshaping, the number travels alone and still reads as an answer.

Verify it yourself:

```bash
pnpm eml run examples/the-caveat-does-not-survive-the-second-hop/the_caveat_does_not_survive_the_second_hop.eml
```
