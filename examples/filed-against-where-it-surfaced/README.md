# Filed against where it surfaced — 1 site named, 4 affected

`filed_against_where_it_surfaced.eml` applies two fixes to the same pipeline —
one at the reported location, one at the source — and measures every consumer.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: an outside reporter locates a defect by following the
value backwards until it stops being visible. That lands on the last place the
value was handled, which is a *surfacing site* by construction. Whether it is
also the cause depends on how many other sites read the same source — a number
that is on the inside.

```
the report
  seen on : the report screen
  input   : ana lee
  actual  : analee#
  correct : analee
  filed against : the report screen's label code

consumers of the normaliser, and whether each shows the defect
  report : analee#  (correct analee)
  invoice : analee#  (correct analee)
  export : analee#  (correct analee)
  search key : analee#  (correct analee)
  sites showing the defect : 4 of 4
  sites named in the report : 1
```

**The local fix works. It works once:**

```
after fixing at the reported location
  report screen wrong : 0 of 4
  other consumers wrong : 12

after fixing at the source instead
  consumers wrong across all sites : 0

sites still showing the defect
  after fixing the reported site : 3 of 4
  after fixing the source        : 0 of 4
```

**And the two fixes are not equivalent even where they agree.** The local fix
strips the marker after the fact; the source fix never produces it. On a name
that legitimately contains the marker character they diverge:

```
a name that legitimately contains the marker
  correct                : c#dev
  fixed at reported site : cdev
  fixed at source        : c#dev
  the local fix is wrong here, and the source fix is right
```

So the surfacing-site fix is not merely incomplete — on one class of input it is
a second defect, introduced by the repair.

Nothing is declared: both fixes are applied to the same pipeline and every
consumer is run.

Verify it yourself:

```bash
pnpm eml run examples/filed-against-where-it-surfaced/filed_against_where_it_surfaced.eml
```
