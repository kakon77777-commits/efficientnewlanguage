# The lesson was filed where nobody looks - 3 of 7 places reach the person who needs it

`the_lesson_was_filed_where_nobody_looks.eml` scores each place a lesson can live by the same three properties and computes the reach rather than arguing it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: writing it down is the recommendation every postmortem ends with, and the document that follows is genuinely good - accurate, specific, indexed. Searching for it requires knowing it exists, and the people who hit this problem are by definition the ones who did not know.

```
places a lesson can be filed : 7
```

```
place                        at the moment   needs prior knowledge   survives turnover   reaches
  a wiki page   no    yes   yes   no
  the postmortem document   no    yes   yes   no
  a team chat message   no    no    no    no
  onboarding training   no    yes   no    no
  a comment at the call site   yes   no    yes   YES
  a test that fails   yes   no    yes   YES
  a lint rule   yes   no    yes   YES
```

```
  places that reach the person who needs it : 3 of 7
```

```
the ones that do not reach
  a wiki page
  the postmortem document
  a team chat message
  onboarding training
  not present at the moment of need : 4
  present but require knowing to look : 0
```

```
the ones that reach
  a comment at the call site
  a test that fails
  a lint rule
  all three are in the path of the work, not in a description of it
```

```
durability against reach
  survive turnover        : 5 of 7
  survive AND reach       : 3
  survive and do NOT reach: 2
  a lesson can be permanent and still never arrive
```

```
control - a reader who already knows the lesson exists
  places they can use : 7 of 7
  which is why the document passes review
```

The lesson was recorded and the recording is correct. Whether it is on the path the next person walks is a property of the place, and the place is chosen by whoever writes the postmortem rather than by whoever needs it.

Two results worth separating: **surviving turnover and reaching are independent** - 5 places survive, 3 of those reach, so a lesson can be permanent and still never arrive. And the **control** shows why the document passes review: for a reader who already knows it exists, every place works.

Verify it yourself:

```bash
pnpm eml run examples/the-lesson-was-filed-where-nobody-looks/the_lesson_was_filed_where_nobody_looks.eml
```
