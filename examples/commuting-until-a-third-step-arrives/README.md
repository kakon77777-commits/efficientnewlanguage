# Commuting until a third step arrives — the pair was interchangeable, the pipeline stopped it being a pair

`commuting_until_a_third_step_arrives.eml` measures whether two steps commute,
then measures the same two steps with one more placed between them.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "these two are independent, the order does not matter"
is a conclusion people reach honestly — by trying both orders and getting the
same answer. It is true of the pair:

```
the pair, applied adjacently, over every input
  inputs where cap;floor != floor;cap : 0 of 9
  the two steps commute
```

It is not a property the pair keeps:

```
the same pair with double() interposed
  inputs where cap;double;floor != floor;double;cap : 5 of 9

witness
  x                    = 60
  cap; double; floor   = 120
  floor; double; cap   = 100
```

Every arrangement, per input:

```
  x = 60 -> distinct answers [120, 100]
  x = 99 -> distinct answers [198, 100]
  x = 100 -> distinct answers [200, 100]
  x = 140 -> distinct answers [200, 100]
  x = 400 -> distinct answers [200, 100]

inputs where arrangement changes the answer: 5 of 9
```

**The control that makes it a measurement rather than an anecdote.** Keep the
third step, but leave the pair adjacent:

```
the two arrangements where cap and floor are still ADJACENT
  inputs where cap;floor;double != floor;cap;double : 0
```

Zero. Adjacent, the pair still commutes. Separated by one step, it does not.

Commutativity is a statement about two functions applied **adjacently**, and
nothing in it survives interposition — which is what a pipeline does for a
living. Someone adds a step, puts it "in the middle where it belongs", and two
neighbours that were interchangeable yesterday are now ordered, with no diff on
either of them and no test that names the pair.

This is a different question from
[successive-percentage-order](../successive-percentage-order/), which sweeps
orderings and counts distinct outcomes. That one asks whether order changes the
answer. This one asks whether a property the code already had is preserved by
composition.

Verify it yourself:

```bash
pnpm eml run examples/commuting-until-a-third-step-arrives/commuting_until_a_third_step_arrives.eml
```
