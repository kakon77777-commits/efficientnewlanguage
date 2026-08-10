# Returns a copy, the second caller assumed in place — the call site is identical

`returns_a_copy_second_caller_assumed_in_place.eml` calls one cleaning helper
two ways over the same input and reports what each caller ends up holding.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the helper's signature does not say whether it cleans in
place or returns a copy. Its tests do not either — they check the return value,
which is correct and passes whether or not the argument was also modified. The
only place the distinction is recorded is the call site, and the two call sites
disagree.

```
the same helper, two call styles, same input
  source                       : [4, -2, 7, -9, 1]
  caller A (uses return value) : [4, 0, 7, 0, 1]  negatives left 0
  caller B (assumed in place)  : [4, -2, 7, -9, 1]  negatives left 2
```

No error, no warning, and a helper that ran and did its job.

**Its own tests are green and structurally cannot fail on this:**

```
the helper's own fixtures, which check the return value
  fixtures failing: 0 of 4

could those fixtures have caught caller B's mistake?
  fixtures whose ARGUMENT changed after the call: 0 of 4
  a return-value test cannot see the difference, because there is none to see
```

**The contrast that shows the call site carries no information:**

```
an in-place helper called the same way caller B called the copying one
  after clean_in_place(c_rows) : [4, 0, 7, 0, 1]  negatives left 0
```

Both helpers pass a return-value test. Both are called with one line. Only one
leaves the caller's data clean, and the two call sites look the same.

`=>` binds a name to a value, so both callers hold a real list either way.
Nothing about the binding says whether the list they hold is the one the helper
worked on — which is the property `tests/aliasing-visibility.ts` (axis 15)
exists to measure, seen here from the caller's side.

Verify it yourself:

```bash
pnpm eml run examples/returns-a-copy-second-caller-assumed-in-place/returns_a_copy_second_caller_assumed_in_place.eml
```
