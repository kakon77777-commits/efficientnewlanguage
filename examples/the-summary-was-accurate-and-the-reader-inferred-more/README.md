# The summary was accurate and the reader inferred more

`the_summary_was_accurate_and_the_reader_inferred_more.eml` - A security review is summarised in one line: reviewed the authentication flow, found three issues, all fixed. Every word of that is true. What a reader takes from it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The summary is honest and it was written carefully. Three issues were found, they were real, all three were fixed and the fixes were verified. The reviewer did not overstate the depth, did not claim completeness, and did not pad the finding count. Compared with most such summaries it is unusually plain.

A summary is a compression, and compression works by dropping what a reader can reconstruct. What was NOT examined has no natural place in it: a finding has a sentence and a non-finding has nothing, so the space that was not looked at leaves no trace of its own size.

The reader's inference is not careless either. Given "reviewed X, found three issues", the ordinary reading is that X was reviewed. That inference is what makes summaries useful, and it is wrong here only because a number the summary does not contain is much larger than the one it does.

```
endpoints in the service : 52000
endpoints examined       : 400
issues found             : 3
issues fixed             : 3
```

```
  coverage        : 7 per mille
  not examined    : 51600
```

```
claim in the summary                    true
  the authentication flow was reviewed    yes
  three issues were found                 yes
  all three were fixed                    yes
  the fixes were verified                 yes
  false claims : 0 of 4
```

```
what a reader takes from it
  the authentication flow has been reviewed   inferred
  the flow now has three fewer issues         inferred, and true
  the flow has been checked for this class    inferred, and not established
  remaining issues of this class              inferred as low; not measured
```

```
  issue rate in the sample : 3 in 400
  endpoints not examined   : 51600
  issues expected there    : 387
  issues reported          : 3
  issues fixed             : 3
```

```
  the summary is a complete account of 3 and silent about 387
  and the silence is not evasion; it is what a summary IS
```

```
the same summary with its denominator
  reviewed 400 of 52000 endpoints in the authentication flow,
  found 3 issues, all fixed
```

```
  words added        : six
  claims added       : none
  inferences removed : the one that mattered
```

```
why nobody asked for the denominator
  the finding count is specific        : 3, not 'several'
  each finding has a fix and a verifier: yes
  the summary avoids the word complete : yes
  precision on the findings reads as precision about the review
  and the more careful the finding list, the stronger that reading
```

```
  a vaguer summary would have been questioned
```

```
control - was the review done well
  endpoints examined thoroughly : yes, all 400
  false findings                : 0
  findings missed within the sample : none known
  fixes verified                : 3 of 3
  defects in the review or the summary : 0
```

```
  the review is correct, the summary is correct, and the sentence a
  reader forms from the summary is not
```

```
null control - the same sentence after a complete review
  endpoints examined : 52000 of 52000
  coverage           : 1000 per mille
  summary wording    : identical
  reader's inference : identical, and now correct
  the summary cannot distinguish the two cases, and neither can the reader
```

```
what a summary drops, and what that costs
  findings        kept, they are what a summary is for
  the population  dropped, an absence has no sentence
  a reader supplies the missing population from context
  and context suggests 'all of it', because that is the usual case
```

```
the fix is not more caution in the wording
it is one number: what was examined, out of what
a finding count with no denominator is not an incomplete summary,
it is a summary of a different quantity
```

The reviewer found 3 real issues, fixed all 3, verified the fixes, and claimed nothing beyond that - which is more restraint than most such summaries show. 400 of 52000 endpoints were examined, 7 per mille, and the same finding rate over the 51600 nobody opened is about 387 more. Six words would have carried that, and they would have added no claim at all.

Verify it yourself:

```bash
pnpm eml run examples/the-summary-was-accurate-and-the-reader-inferred-more/the_summary_was_accurate_and_the_reader_inferred_more.eml
```
