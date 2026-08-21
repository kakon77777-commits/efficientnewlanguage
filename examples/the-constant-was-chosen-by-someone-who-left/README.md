# The constant was chosen by someone who left

`the_constant_was_chosen_by_someone_who_left.eml` - The constant is 4096 and nobody currently on the team knows why. What depends on it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Leaving it alone is the correct default. It has worked for six years, the person who chose it was competent, and a number that has survived that long in production has been tested by more traffic than any experiment anybody could run this quarter.

"It works" is evidence about the current value and not about the reasoning. Whether the constraint that produced it still exists is a separate question, and it is one the number cannot answer, because a constant that is right for a reason and a constant that is right by accident look identical.

The dependents are enumerated and the original constraint is checked.

```
the constant : 4096, in place 6 years
places that reference it : 6
  would break if it changed : 4
  that copied the number rather than importing it : 3
```

```
dependent                        breaks   relationship
  buffer allocation   yes      derived from it
  page size in the on-disk format   yes      derived from it
  the batch size in the importer   yes      copied it
  a test fixture   no       copied it
  the retry chunk size   yes      copied it
  a comment in the protocol doc   no       describes it
```

```
candidate constraints, and whether they still hold
  the disk page on the 2020 hardware : 4096  gone   
  the disk page on the current hardware : 16384  current
  the network MTU path : 1500  current
  the allocator bucket : 8192  current
```

```
constraints that still hold : 3 of 4
constraints whose value equals the constant : 1
constraints that both hold today AND equal the constant : 0
  none - the only constraint the number matches is the one that is gone
```

```
what six years of working establishes
  the value does not break anything today : yes
  the value is optimal today              : not tested
  the reason for the value still holds    : not tested
  a number that is right by accident produces exactly this evidence
```

```
measuring it instead of reasoning about it
  candidates to try : the 3 constraints that still hold
  what a benchmark answers : which value is fastest on this hardware
  what it does not answer  : which of the 3 copies would also have to move
  the copies are the expensive part, and they are expensive because the
  number was copied rather than imported
```

```
control - the same constant written as a derivation
  page_size = query_the_filesystem()
  places that would need updating when the hardware changes : 0
  what is lost : nothing, on this dependent set
  what is gained : the question this case is about cannot be asked, because
  the reason is in the expression
```

The number has survived six years of production and the person who chose it knew the hardware. Working is evidence about the value; the constraint it was derived from is a separate fact, and it is the one that expired.

Verify it yourself:

```bash
pnpm eml run examples/the-constant-was-chosen-by-someone-who-left/the_constant_was_chosen_by_someone_who_left.eml
```
