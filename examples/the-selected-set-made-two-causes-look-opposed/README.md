# The selected set made two causes look opposed

`the_selected_set_made_two_causes_look_opposed.eml` - Among admitted students, academic and athletic scores are negatively related: the weaker a student is academically, the stronger athletically. The correlation is real and correctly computed. What the sample was conditioned on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It uses the real recorded scores, not estimates; it covers every admitted student; the conditional rates are honest counts; and the intent is exactly 'are the two abilities related'.

Admission required being high in at least one of the two, so a low-academic admit must be high-athletic - the sample is conditioned on a common effect of both, and that manufactures the negative relation.

```
applicants                      : 10000
  rejected (low in both)        : 2500
  admitted                      : 7500
```

```
among admitted, high-athletic given high-academic : 5000 per myriad
among admitted, high-athletic given low-academic  : 10000 per myriad
manufactured gap                : 5000 per ten thousand
```

```
the correlation measurement
  uses : the real recorded scores, not estimates
  covers : every admitted student
  rates : honest counts of high-athletic within each group
  intent : are academic and athletic ability related
  students omitted : 0
  verdict : AMONG ADMITTED, LOWER ACADEMIC MEANS HIGHER ATHLETIC
```

```
  computing the conditional rates from real counts over
  every admitted student is the part done right here, and
  it is why the negative relation in that sample is genuine
```

```
the set the rates were computed over
  who is in it : admitted students only
  the admission rule : high in academics OR athletics
  what that rule is : a common effect of both abilities
  a low-academic student who was admitted : must have been
    high-athletic, or would have been rejected
  so within the admitted : low academic forces high
    athletic, a relation the rule created, not the abilities
```

```
the conclusion drawn
  claim : athletic training crowds out academics
  gap among admitted : 5000 per myriad
  gap in the full applicant pool : 0, the two are
    independent
  are the admitted rates wrong : no; they are exact
  do the abilities oppose each other : no; conditioning on
    admission, a collider, made independent traits look
    opposed
```

```
null control - measure the full applicant pool, not the admitted
  high-athletic given high-academic, full pool : 5000 per myriad
  high-athletic given low-academic, full pool  : 5000 per myriad
  gap in the full pool : 0
  no student and no score changed; the rates stopped being
  taken over the common effect and started being taken over
  everyone
```

```
what a correlation over a selected sample guarantees
  the relation within the sample is correctly computed :
    exactly, real scores, every admit, honest rates
  the two abilities are related in the world : not
    addressed; admission requires high in one or the other,
    so conditioning on it forces a low-academic admit to be
    high-athletic - a 5000-per-myriad gap that is 0 in the pool
```

```
selection on a common effect of two independent causes correlates them among the
selected; requiring at least one to be high means whoever is low on one is high
on the other, so the relation is a fact about the gate, not about the causes
```

It computes honest conditional rates over every admitted student - the negative relation in that sample is real. But admission requires being high in one ability or the other, a collider, so a low-academic admit must be high-athletic; over the full pool the gap is 0, and the whole 5000 per myriad is the selection.

Verify it yourself:

```bash
pnpm eml run examples/the-selected-set-made-two-causes-look-opposed/the_selected_set_made_two_causes_look_opposed.eml
```
