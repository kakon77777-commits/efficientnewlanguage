# Last batch takes a different path — the remainder is zero in every fixture

`last_batch_takes_a_different_path.eml` runs every input length from 0 to 12
through a buffered writer with batch size 4, and checks whether the records
that left through the drain path got the same treatment as the rest.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a buffered loop has two exits and only one of them is in
the loop. The second is written later, under time pressure, to fix a symptom —
records lost on shutdown — and it fixes exactly that symptom, not everything
the main path accumulated afterwards.

| n | n mod 4 | via loop | via drain | unstamped (buggy) | unstamped (fixed) |
| --- | --- | --- | --- | --- | --- |
| 4 | **0** | 4 | 0 | **0** | 0 |
| 5 | 1 | 4 | 1 | **1** | 0 |
| 6 | 2 | 4 | 2 | **2** | 0 |
| 7 | 3 | 4 | 3 | **3** | 0 |
| 8 | **0** | 8 | 0 | **0** | 0 |

9 of the 13 lengths lose the stamp. The number affected is **exactly `n mod
batch`** — computed on both sides and compared at every length, with 0
mismatches, so that equality is a measurement rather than a claim.

Which input lengths a fixture reaches for:

```
n = 0   divides evenly -> drain path never runs -> defect invisible
n = 4   divides evenly -> drain path never runs -> defect invisible
n = 8   divides evenly -> drain path never runs -> defect invisible
n = 12  divides evenly -> drain path never runs -> defect invisible
```

And nothing is lost, at any length, under either drain:

```
input lengths where a record went missing: 0
```

So no count, no length check and no "did everything arrive" test can see it.
The path that gets the least review is also the one the tests are least likely
to enter, and the reminder that it exists is `n mod batch` — zero on every
round number anybody picks for a fixture.

Verify it yourself:

```bash
pnpm eml run examples/last-batch-takes-a-different-path/last_batch_takes_a_different_path.eml
```
