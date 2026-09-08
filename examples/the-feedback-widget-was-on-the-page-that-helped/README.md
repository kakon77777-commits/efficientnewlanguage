# The feedback widget was on the page that helped

`the_feedback_widget_was_on_the_page_that_helped.eml` - Every help article ends with "was this useful?", the responses are stored with the article and the query that led there, and 94 percent say yes. Who answers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The instrument is well built. It is not a star rating nobody understands; it is one question with two answers, placed at the end of the article rather than in a modal; the response is stored with the article version and the search query that led there, so a regression is attributable; and the team reads it and has rewritten eleven articles because of it.

The widget is at the BOTTOM of the article. Reaching it means having read to the end, and a reader who found the article irrelevant in the first paragraph closes the tab above it.

Sixty-one percent of sessions leave before the widget is on screen.

```
yes share                       : 9400 per ten thousand
  no share                      : 600 per ten thousand
questions the widget asks       : 1
articles rewritten because of it: 11
```

```
article sessions per month      : 480000
  reaching the widget, percent  : 39
  able to answer                : 187200
  leaving before it, percent    : 61
  that never saw it             : 292800
```

```
responses from a session that left early : 0
alerts on the early-leave rate           : 0
```

```
the instrument
  what it asks : 1 question with two answers
  what it is not : a star rating nobody can interpret
  where it sits : at the end of the article, not in a
    modal over it
  what is stored with the answer : the article version
    and the query that led there
  so a regression is : attributable
  articles rewritten because of it : 11
  verdict : A REAL SIGNAL
```

```
  one question, at the end, stored with its context is
  better than most feedback and this one is acted on
```

```
the reachable population
  where the widget is : below the article
  what reaching it requires : reading to the end
  a reader whose answer would be no : often stops in the
    first paragraph
  what that reader contributes : nothing
  sessions in that state per month : 292800
  responses from them : 0
```

```
  the question is well posed and it is posed after the
  event that decides the answer
```

```
moving it up
  who would then answer : readers who have not read the
    article
  what that measures : the title
  is the current placement wrong : no
  is the reachable population narrower than the question
    implies : yes
  both of those are true at once
```

```
what the analytics already hold
  scroll depth per session : recorded
  time on page per session : recorded
  sessions leaving above the widget : 292800
  is that number in the feedback report : no
  alerts on it : 0
  what an article that fails everyone looks like : a high
    yes share and a high early-leave rate
```

```
null control - report the reach beside the rate
  yes share : 9400 per ten thousand, unchanged
  denominator reported beside it : 187200
  alerts on the early-leave rate : 1
  the widget did not move; the number it produces stopped
  being readable without the population it came from
```

```
what a high satisfaction rate guarantees
  the people who answered were helped : exactly, and the
    question is well posed
  the article helps people : not addressed; answering
    requires reaching the question, and reaching it
    requires the outcome the question asks about
```

```
an instrument placed after an outcome is answered only by
the outcomes that reach it; the placement can be correct and
the population still selected, and the selection runs in the
direction that flatters
```

The widget is one question with two answers, at the end of the article, stored with the version and the query, and it has driven 11 rewrites - 9400 per ten thousand say yes. Reaching it means reading to the end, so 292800 of 480000 sessions a month leave above it and contribute 0 responses, under 0 alerts on the rate at which that happens.

Verify it yourself:

```bash
pnpm eml run examples/the-feedback-widget-was-on-the-page-that-helped/the_feedback_widget_was_on_the_page_that_helped.eml
```
