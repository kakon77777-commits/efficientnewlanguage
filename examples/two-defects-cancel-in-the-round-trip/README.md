# Two defects cancel in the round trip — and half a fix is worse than none

`two_defects_cancel_in_the_round_trip.eml` runs an encoder and a decoder that
are both wrong, through the only test either of them has.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the wire protocol defines a code as a count of 4-unit
steps. Our encoder divides by 5; our decoder multiplies by 5. Encode-then-decode
returns exactly what went in, so the round-trip test passes and always has.

**The shape of the repair is the finding.** Four states — fix neither, fix the
encoder, fix the decoder, fix both:

```
round-trip error on the test fixture (multiples of 20)
  encoder ours + decoder ours : 0
  encoder ours + decoder spec : 84
  encoder spec + decoder ours : 105
  encoder spec + decoder spec : 0
```

The two clean states are **both wrong** and **both right**. A partial rollout —
the normal way a fix reaches production — lands in one of the other two, so
fixing half of this looks exactly like breaking it.

**Production values are lossy in every state, and that is the encoding working
as designed** — dividing by a step size discards the remainder. So the honest
question is not which state reaches zero, but whether the groups overlap:

```
matched pairs against mismatched pairs, on production values
  worst error when encoder and decoder agree    : 24
  best error when they disagree                 : 145
  the two groups do not overlap, so agreeing matters more than being right
```

**Where it does fail is every edge the pair does not own:**

```
the code on the wire, ours against the protocol
  values where our code matches the protocol : 2
  values where it does not                   : 10
  first disagreement: raw 13 -> we send 2, protocol says 3

a conforming partner decoding what we send
  values they read wrongly : 11 of 12
  worst error              : 24

us decoding what a conforming partner sends
  values we read wrongly : 11 of 12
  worst error            : 30
```

Note the fixture: multiples of 20, a multiple of *both* step sizes, which
nobody chose on purpose. On its own fixture the test can produce 3 distinct
outcomes across 4 states; on production values it can produce 4.

Nothing in the program declares which states pass. Every error is computed by
running the pair and comparing against the input.

**How this differs from the rest of the corpus.** Every other composition case
here has stages that are each correct and a seam that is not —
[each-stage-verified-nobody-verified-the-seam](../each-stage-verified-nobody-verified-the-seam/),
[the-safe-range-of-a-composition](../the-safe-range-of-a-composition/). This one
inverts it: the stages are each wrong and the composition is right, so verifying
the parts is exactly what would find it and verifying the whole never can.

Verify it yourself:

```bash
pnpm eml run examples/two-defects-cancel-in-the-round-trip/two_defects_cancel_in_the_round_trip.eml
```
