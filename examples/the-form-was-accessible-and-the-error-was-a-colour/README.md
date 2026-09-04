# The form was accessible and the error was a colour

`the_form_was_accessible_and_the_error_was_a_colour.eml` - The form passes every automated accessibility check, a hundred and forty-eight of them. How a user is told a field is wrong is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The accessibility work was done and it was not box-ticking. Every input has a programmatically associated label, the tab order follows the visual order, the landmarks are right, focus is visible and never trapped, the contrast ratios exceed the requirement rather than meeting it, and the checker runs in the pipeline so a regression fails the build.

What the checker verifies is what a machine can decide from the document. That an error is CONVEYED is a semantic question: the rule says do not use colour as the only means of conveying information, and deciding whether something is the only means requires knowing what the something means.

A failed field gets a red border. There is no text, no icon, and no announcement.

```
automated checks             : 148
passed                       : 148
failed                       : 0
contrast failures            : 0
```

```
fields                       : 15
errors signalled by colour only : 15
sessions per day             : 41000
sessions that cannot see it  : 1845
```

```
the automated suite
  labels programmatically associated : all 15
  tab order follows visual order     : yes
  landmarks                          : correct
  focus visible, never trapped       : yes
  contrast                           : exceeds, not merely meets
  runs in the pipeline               : yes, a regression fails the build
  verdict                            : ACCESSIBLE
```

```
  this is a real implementation and the pipeline gate
  keeps it real
```

```
the two kinds of rule
  is this contrast ratio above 4.5 : a machine can measure
  is this label associated          : a machine can read
  is colour the ONLY means of conveying this : requires
    knowing what is being conveyed
  so the third is                   : not in the suite,
    and correctly not in it
```

```
  the checker is not failing to test it; a checker cannot
  hold the premise the rule is about
```

```
share of fields whose error is colour only : 10000 per ten thousand
```

```
a failed submission
  what changes visually : one border becomes red
  text explaining it    : none
  icon                  : none
  announcement to assistive technology : none
  what a user who cannot see the change experiences :
    a button that does nothing
```

```
null control - the error also written and announced
  automated checks passed : 148, unchanged
  errors signalled by colour only : 0
  the suite did not get stricter; the signal stopped
  having exactly one channel
```

```
what a passing accessibility suite guarantees
  every machine-decidable rule holds : exactly
  the interface can be used          : not addressed; the
    rules that need a reader to know what something means
    are the ones a checker cannot hold, and they are not
    the easy ones
```

```
an automated suite partitions the guidelines into the ones it
can decide and the ones it cannot, and reports only on the
first; a green build is a statement about that partition
```

The form passes all 148 automated checks with 0 failures and 0 contrast problems, on labels, tab order, landmarks, focus and ratios that exceed rather than meet. All 15 fields signal a validation error with a red border alone - 10000 per ten thousand - which no checker can decide is the only means, and about 1845 sessions a day meet a button that appears to do nothing.

Verify it yourself:

```bash
pnpm eml run examples/the-form-was-accessible-and-the-error-was-a-colour/the_form_was_accessible_and_the_error_was_a_colour.eml
```
