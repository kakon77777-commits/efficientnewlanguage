# Silence was recorded as assent

`silence_was_recorded_as_assent.eml` - A proposal process counts a non-response as approval. What the approvals mean is computed below by separating the votes that were cast from the votes that were assumed.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rule is reasonable and it was adopted for a reason. Before it, one unreturned review blocked a proposal for weeks, reviewers went on holiday, and the queue was measured in months rather than days. Treating silence as assent unblocked the process and the throughput improvement was immediate and real.

A recorded approval now has two possible origins: somebody read the proposal and agreed, or the window closed. The record does not distinguish them, and the proportion of each is not fixed - it moves with how much time reviewers have, which is not a property of the proposal.

The two origins are counted separately below.

```
proposal            reviewers   yes   no   silent   days open   recorded as
  retention policy   9          2     0    7        5          approved
  index rebuild   9          6     1    2        14          blocked
  auth migration   9          3     0    6        5          approved
  log schema   9          1     0    8        3          approved
  vendor swap   9          7     2    0        21          blocked
  cache eviction   9          2     0    7        5          approved
```

```
across 6 proposals
  reviewer slots     : 54
  explicit yes       : 21, 38%
  explicit no        : 3, 5%
  silent             : 30, 55%
  recorded approvals : 51, 94%
```

```
the recorded approval rate, split by where it came from
  from somebody agreeing : 41%
  from the window closing: 59%
  most of the approval in this record was never given by anybody
```

```
days open against the share of explicit responses
  retention policy : 5 days, 22% responded
  index rebuild : 14 days, 77% responded
  auth migration : 5 days, 33% responded
  log schema : 3 days, 11% responded
  vendor swap : 21 days, 100% responded
  cache eviction : 5 days, 22% responded
  shortest window : log schema, 3 days, 11% responded
  longest window  : vendor swap, 21 days, 100% responded
  response is a function of the window, and the window is set by whoever
  is in a hurry
```

```
the proposals that were blocked
  index rebuild : 14 days open, 7 of 9 responded
  vendor swap : 21 days open, 9 of 9 responded
  blocked : 2 of 6
  every one of them had a window long enough for somebody to read it
  proposals under a week that drew a no : 0
```

```
the same six under a rule that requires an explicit majority
  approved under the current rule : 4 of 6
  approved under an explicit majority : 0 of 6
  the difference is 4 proposals that nobody voted against and
  that fewer than half the reviewers answered on at all
```

```
control - vendor swap, 21 days open
  responded : 9 of 9, silent : 0
  yes 7, no 2
  here the outcome came from 9 people who read it, and the rule
  about silence never had to be applied
```

Counting silence as assent fixed a queue that really was measured in months. It also made an approval and an unread proposal produce the same record, and 59% of the approvals here are the second kind.

Verify it yourself:

```bash
pnpm eml run examples/silence-was-recorded-as-assent/silence_was_recorded_as_assent.eml
```
