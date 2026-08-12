# Validated on records that already passed — a clean run over real production data

`validated_on_records_that_already_passed.eml` runs a validator over the store
it produced, and over the submissions that store came from.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "we ran it over production data" is the strongest-sounding
sentence in a review. When the data reached production *through* the thing being
tested, it is close to the weakest.

```
submissions received : 10
admitted to the store : 7

the lenient validator, re-run over the store it produced
  records rejected : 0 of 7
  a clean run over real production data

the same validator, over the submissions
  records rejected : 3 of 10
```

**The validator is wrong, and the clean run cannot say so.** The specification
rejects codes beginning with `Z`; the validator does not:

```
records the specification rejects and the validator admits
  in the store : s2 code Z999
  in the store : s5 code Z100
  in the store : s8 code Z000
  total in the store : 3
```

Three of the seven records in the database violate the rule the validator
exists to enforce, and every one of them passes the validator, because passing
the validator is how they got there.

**The store cannot exercise half the code:**

```
outcomes reachable when the validator is run over the store
  accept branch : 7
  reject branch : 0

outcomes reachable when it is run over the submissions
  accept branch : 7
  reject branch : 3
```

And the corrected validator is judged very differently by the two populations —
the store understates how much would change, because the store is already the
lenient validator's opinion:

```
the strict validator, which implements the specification
  rejects, over the store       : 3 of 7
  rejects, over the submissions : 6 of 10
```

Nothing is declared: the store is built the ordinary way, both populations are
measured, and the disagreement between the two validators is counted on each.

**Related, and a different question.**
[fixture-avoids-the-boundary](../fixture-avoids-the-boundary/) is about a
fixture that happens to miss the interesting case. This one is about a sample
that *cannot* contain it — not by accident of authorship, but because the
system under test is what filled the sample.

Verify it yourself:

```bash
pnpm eml run examples/validated-on-records-that-already-passed/validated_on_records_that_already_passed.eml
```
