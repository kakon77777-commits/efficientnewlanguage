# The check ran on a copy and the original was used

`the_check_ran_on_a_copy_and_the_original_was_used.eml` - Every request is normalised, then validated, and the validator has never passed a bad value. Which value the handler then uses is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Normalising before validating is correct and it is the order the rules were written for. Validating raw input means every rule carries its own trimming, case folding and unicode handling, the rules drift apart, and the one that forgets is the hole. Normalise once, validate the normal form, and each rule states one thing. The normaliser is well tested and the validator is strict.

The normaliser returns a new value rather than editing in place, which is also correct: a pure function is testable and cannot corrupt its input on a rejection path.

So there are two values. The validator was handed one of them.

```
requests per day                      : 240000
normal form differs from the input    : 37 per thousand
requests where they differ            : 8880
requests where they are identical     : 231120
```

```
the pipeline
  1  read the request body       -> original
  2  normalise(original)         -> normal
  3  validate(normal)            -> pass or reject
  4  handle(original)
```

```
  step 3 and step 4 name different variables
  and both names are correct for their own line
```

```
the validator's record
  values validated  : 240000
  values rejected   : 0
  pass rate         : 100 percent
  false accepts     : 0
```

```
  every one of those is true about the value it was given
  values it was given that reached the handler : 231120
```

```
what normalisation changes, and what the handler then sees
  trailing whitespace stripped     handler sees it back
  email address lower-cased        handler sees the original case
  unicode direction marks removed  handler sees the marks
  repeated slashes in a path collapsed  handler sees them repeated
```

```
  requests affected : 8880 per day
  requests where the validator's verdict was about a value
  nothing downstream ever reads : 8880
```

```
one request, both values
  original : a path with two slashes and a trailing space
  normal   : the same path, collapsed and trimmed
  validate(normal)  : passes, the path is inside the allowed root
  handle(original)  : resolves a different path
```

```
  the validator is correct, the normaliser is correct,
  and the conclusion does not travel with the value
```

```
the test suite
  unit tests on the normaliser : pass
  unit tests on the validator  : pass
  end-to-end tests             : 12, all passing
  of those, inputs whose normal form differs : 0
```

```
  fixtures are written in normal form, because a person writing
  one types the tidy version, so the two values coincide in
  every test and the bug has no input that can express it
```

```
control - are the two components correct
  normaliser output correct  : yes, on all 240000
  normaliser mutates input   : no, by design
  validator false accepts    : 0
  validator false rejects    : 0
  defects in either component : 0
```

```
  the purity that makes the normaliser safe is what creates
  the second value
```

```
null control - the same pipeline handing step 4 the normal form
  requests where the values differ : 8880
  requests validated               : 240000
  requests where the verdict applies to what ran : 240000
  one identifier changed on one line
```

```
what a passing validation is a statement about
  the value passed to it       : yes, completely
  the value used afterwards    : only if they are the same object
  and a pure normaliser guarantees they are not
```

```
the check is not too weak and the normaliser is not wrong;
the verdict simply does not name the value it will be quoted
about, and nothing in either signature says so
```

The normaliser is pure and correct, the validator has 0 false accepts and 0 false rejects across 240000 requests a day, and the order they run in is the order that keeps the rules from drifting. On the 8880 requests a day whose normal form differs from their input, the verdict describes a value the handler never sees, and the 12 end-to-end tests cannot show it because 0 of their inputs are written in a form that needs normalising.

Verify it yourself:

```bash
pnpm eml run examples/the-check-ran-on-a-copy-and-the-original-was-used/the_check_ran_on_a_copy_and_the_original_was_used.eml
```
