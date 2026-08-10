# The default chosen for the first caller — and the aggregate that hides it

`default_chosen_for_the_first_caller.eml` runs one `average()` with one
empty-input default past two callers for whom that default means opposite
things.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `average([]) == 0` is exactly right for the caller it
was written for — penalty points, where no penalties is zero penalties and the
zero is the true value. The second caller averages satisfaction ratings on a
1–5 scale, where an empty list means "not surveyed" and 0 is not a low rating;
it is not a rating at all.

The helper cannot tell them apart, because the difference is not in the list.
It is in what the list is a list **of**, which the helper never sees.

```
caller A - penalty points, where 0 is the true value for an empty list
  per-driver means, empty counted as 0 : [1.5, 0.0, 4.0, 0.0, 3.0, 0.0]
  overall, empty counted as 0          : 1.4166666666666667
  overall, empty skipped               : 2.8333333333333335

caller B - ratings on a 1 to 5 scale, where an empty list means not surveyed
  per-driver means, empty counted as 0 : [4.5, 0.0, 3.0, 0.0, 4.333333333333333, 0.0]
  overall, empty counted as 0          : 1.972222222222222
  overall, empty skipped               : 3.944444444444444
```

**The check that does not need to know the right answer.** Two averages differ
for many innocent reasons, so a gap proves nothing. What separates the callers
is that only one produces a number its own scale says cannot exist:

```
values that fall outside the 1 to 5 scale the ratings are defined on
  per-driver means below 1 : 3 of 6
  the OVERALL rating is 1.972222222222222, which is inside 1..5
  so the aggregate is where the impossibility stops being visible

the same check applied to caller A
  per-driver means below 0 (penalties cannot be negative) : 0 of 6
```

**That last pair of lines is the finding.** Three of six per-driver ratings are
below the bottom of the scale — impossible values, checkable without knowing
the right answer. Average them once more and the result lands back inside 1–5.
The report a human reads is the one place the defect cannot be seen.

Related but a different question: [empty-input-conventions](../empty-input-conventions/)
asks what `f([])` ought to return. This file takes the return as given and
observes that there is one helper and two callers, so at most one of them can
be right — and nothing at either call site records which one it was written for.

Verify it yourself:

```bash
pnpm eml run examples/default-chosen-for-the-first-caller/default_chosen_for_the_first_caller.eml
```
