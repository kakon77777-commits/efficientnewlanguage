# Fixture avoids the boundary — which values can detect an off-by-one

`fixture_avoids_the_boundary.eml` sweeps every integer in a window across a
correct implementation and three off-by-one variants, and reports which values
distinguish which.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "is this fixture good" has a computable answer —
introduce the defect, run the fixture, see whether the answer changes.

```
integers swept: 101 (5 through 105)
integers that detect ANY of the three defects: 3
```

Under 3% of the window detects anything. A value chosen for readability is
being chosen from the 97% that cannot.

| fixture | values | defects detected |
| --- | --- | --- |
| readable (25, 50, 75) | 3 | **0/3** |
| boundary-aware | 8 | **3/3** |

The readable fixture is not smaller in any meaningful way — it is chosen
differently. All three of its values are **accepted** by the correct
implementation, so it never exercises a rejection at all: the only branch it
takes is the one that says yes.

And there is no slack anywhere: each of the three defects has **exactly one**
witness in the whole window. Miss that integer and the defect is invisible.

The useful question is not how many cases a suite has but whether any of its
values sit where the answer *changes*.

Verify it yourself:

```bash
pnpm eml run examples/fixture-avoids-the-boundary/fixture_avoids_the_boundary.eml
```
