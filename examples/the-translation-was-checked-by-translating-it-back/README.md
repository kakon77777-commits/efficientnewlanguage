# The translation was checked by translating it back

`the_translation_was_checked_by_translating_it_back.eml` - The translation passed its round-trip check on 97 of every 100 sentences, and the check is real. What does the translating back is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The check is run on everything. Every sentence is translated back to the source and compared; the comparison is not fuzzy-graded into a pass; a mismatch is queued for human review; and the pass rate is tracked per release.

The back-translation uses the same model as the forward translation.

```
sentences                       : 5000
  back-translation matched      : 4850
round-trip match rate           : 9700 per ten thousand
```

```
mistranslations a human found   : 620
  the back-translation caught   : 40
  that round-tripped cleanly    : 580
true fidelity                   : 8760 per ten thousand
```

```
the round-trip check
  coverage : every sentence
  comparison : exact, not fuzzy-graded into a pass
  on a mismatch : queued for human review
  tracked : per release
  sentences that matched on return : 4850
  verdict : FAITHFUL
```

```
  refusing to fuzzy-grade the comparison is the part
  almost nobody holds to, and it is why a match is not
  quietly inflated
```

```
the back-translation
  model forward : the translation model
  model back : the same one
  a systematic error it makes : it makes in reverse too
  so a wrong rendering : is translated back to the
    original wrongly-but-consistently, and matches
  mistranslations that survived the round trip : 
    580
```

```
the reader in the target language
  sentences a human judged wrong : 
    620
  of those the check flagged : 
    40
  is the round-trip metric wrong : no; the strings do
    match on return
  what a match means here : the model agrees with itself,
    not that the meaning survived
  true fidelity to a human : 8760 per ten thousand
```

```
null control - back-translate with a different model
  round-trip, same model : 9700, unchanged
  round-trip, a different model : 
    8804 per ten thousand
  mistranslations it would flag : 
    580
  no sentence changed; the reverse pass stopped sharing
  the forward pass's blind spots
```

```
what a passing round-trip check guarantees
  the sentence returns to its original : exactly, on 
    4850 of 5000, exact comparison, humans on the rest
  the translation is faithful : not addressed; the check
    translates back with the same model, which repeats its
    own errors in reverse, so 580 of them round-trip
    cleanly
```

```
a round trip through one model tests the model against itself, and a systematic
error is exactly what a system does the same way every time; the return journey
undoes the mistake it also makes
```

Every sentence is back-translated and compared exactly, mismatches sent to humans - 9700 per ten thousand match. The back-translation is the same model, so it repeats its own errors in reverse: 580 mistranslations round-tripped cleanly, leaving true fidelity at 8760 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-translation-was-checked-by-translating-it-back/the_translation_was_checked_by_translating_it_back.eml
```
