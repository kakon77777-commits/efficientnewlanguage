# The questionnaire was answered by the vendor

`the_questionnaire_was_answered_by_the_vendor.eml` - Every vendor that touches customer data completes a one-hundred-and-eighty-question security review before a contract is signed, and forty-one have been rejected or made to remediate. Who writes the answers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The programme is real. A review takes six hours of a reviewer's time rather than a checkbox; the questions were written by the security team and not bought as a template; a vendor cannot be onboarded while a review is open, and that block is in the procurement system rather than in a policy; and forty-one vendors in thirty-three months were stopped or made to change something.

The answers are the vendor's. So is every document attached to them.

```
vendors reviewed                : 340
questions per review            : 180
  that ask for a document       : 22
  answered by assertion alone   : 158
  document-backed               : 1222 per ten thousand
questions asked in total        : 61200
answers checkable without them  : 0
```

```
reviewer hours per review       : 6
reviewer hours spent            : 2040
months the programme has run    : 33
```

```
vendors rejected or remediated  : 41
  rejected share                : 1205 per ten thousand
  for what the vendor said      : 41
  for an answer shown to be false : 0
```

```
breaches at a reviewed vendor   : 3
  in an area the questions cover: 3
```

```
the vendor security review
  effort : 6 reviewer hours each, not a checkbox
  the questions : written by the security team, not a
    bought template
  the block : a vendor cannot be onboarded while a review
    is open, and that is enforced in procurement rather
    than written in a policy
  stopped or changed in 33 months : 41
  verdict : REVIEWED
```

```
  putting the block in the procurement system rather than
  in a policy is the part almost nobody does, and it is
  why the 41 were actually stopped
```

```
where each answer comes from
  who writes it : the vendor
  who writes the attached document : the vendor
  questions answered by assertion alone : 
    158 of 180
  answers checkable against something the vendor does
    not control : 0
  so what a completed review establishes : what they
    said, in writing, on the record
```

```
  the subject of the question and the author of the
  answer are the same party
```

```
the rejections
  for answering no, or refusing to answer : 
    41
  for an answer that was checked and found false : 
    0
  what that pair means : the programme discriminates
    between vendors who admit a gap and vendors who do
    not, which is a real distinction and not the one the
    questionnaire is about
  a vendor with the same gap who answers yes : passes
```

```
breaches at vendors that passed
  breaches : 3
  in areas the questionnaire asks about : 
    3
  what those vendors had answered : yes
  was the answer wrong when given : unknown; nothing
    recorded the state at the time
  did the review fail : no. It asked, and it recorded
    the answer, and the answer is what it recorded
```

```
null control - check a sample against outside sources
  reviews completed : 340, unchanged
  answers checked independently : 100
  answers that did not match : 9
  the questionnaire did not get better; a second author
  was found for a hundred of its answers
```

```
what a completed vendor review guarantees
  the vendor stated that they do these things : exactly,
    180 questions, 6 hours, on the record, and 
    41 were stopped over what they stated
  the vendor does these things : not addressed; the
    answer and the thing it is about have the same
    author, and 0 answers are checkable without them
```

```
asking carefully is not the same as finding out; a review
whose every input is written by its subject measures what
the subject is willing to write down
```

The questions were written in-house, a review costs 6 reviewer hours, onboarding is blocked in procurement while one is open, and 41 vendors were stopped in 33 months. Every answer and every attached document is the vendor's own - 158 of 180 questions carry no document at all, 0 answers are checkable without them, and 0 of the 41 were rejected for saying something untrue.

Verify it yourself:

```bash
pnpm eml run examples/the-questionnaire-was-answered-by-the-vendor/the_questionnaire_was_answered_by_the_vendor.eml
```
