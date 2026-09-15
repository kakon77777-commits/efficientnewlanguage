# The anchor bound to one alternative

`the_anchor_bound_to_one_alternative.eml` - A whitelist accepts a value only if it is exactly "cat" or "dog", and it uses the regex engine correctly on every value. What the anchors bind to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The check is careful. It applies the pattern to the real value, not a substring; it uses the engine's own regex; it runs on every value; and the intent is exactly 'the whole value is one of the two allowed words'.

The pattern is ^cat|dog$, and alternation has the lowest precedence, so it reads as (^cat) or (dog$) - each anchor binds to one branch, not to both words.

```
values tested                   : 100000
  exactly cat or dog            : 40000
  start-cat or end-dog, not exact : 500
```

```
accepted by ^cat|dog$           : 40500
accepted by ^(cat|dog)$         : 40000
wrongly accepted                : 500
share of accepted that is neither word : 123 per ten thousand
```

```
the whitelist
  applies to : the real value, not a substring
  uses : the engine's own regex
  runs on : every value
  intent : the whole value is exactly cat or dog
  values skipped : 0
  verdict : EVERY ACCEPTED VALUE MATCHES THE PATTERN
```

```
  using the engine's regex over every value is the part
  done right here, and it is why a real cat or dog is
  always accepted
```

```
^cat|dog$
  precedence of alternation : the lowest of all
  so the pattern groups as : (^cat) or (dog$)
  what the left branch requires : starts with cat, end free
  what the right branch requires : ends with dog, start free
  so catfish and hotdog : both match, one per branch
```

```
the result of the whitelist
  values it should accept : the 40000 exact words
  values it accepted : 40500, prefixes and suffixes too
  neither-word values wrongly accepted : 500
  is the pattern malformed : no; it compiles and runs
  did the anchors cover both words : no; each bound to one
    branch, and the fixtures only used the exact words
```

```
null control - group the alternation, ^(cat|dog)$
  neither-word accepted, ungrouped : 500
  neither-word accepted, grouped : 0
  values the grouping now rejects : 500
  no value and no alternative changed; the anchors stopped
  binding to one branch and started binding to the choice
```

```
what a ^cat|dog$ whitelist guarantees
  the value matches one of the branches : exactly, the
    engine's own match over every value
  the value is exactly cat or dog : not addressed;
    alternation binds looser than the anchors, so the
    pattern is (^cat) or (dog$) and accepts catfish and
    hotdog - 500 values that are neither word
```

```
an anchor attaches to the branch beside it, not to the alternation as a whole;
without a group the choice reaches past the anchors, and a whitelist meant to
name two exact words instead names two open-ended halves
```

It runs the engine's regex over every value - a real cat or dog always matches. But ^cat|dog$ parses as (^cat) or (dog$), so catfish and hotdog pass; 500 neither-word values were accepted, 123 per ten thousand of the accepted set, until the alternation was grouped.

Verify it yourself:

```bash
pnpm eml run examples/the-anchor-bound-to-one-alternative/the_anchor_bound_to_one_alternative.eml
```
