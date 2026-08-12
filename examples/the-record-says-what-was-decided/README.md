# The record says what was decided — 6 of 6 answered, 0 of 6 checkable

`the_record_says_what_was_decided.eml` tries to re-derive every decision from
each of two records and counts how many it can reach.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the audit log is complete, well-formatted and never loses
an entry. What it does not contain is the values the rules were applied *to*,
because those were on the request and the request is gone.

```
decisions a reviewer can re-derive
  from the decision log : 0 of 6
  from the raw events   : 6 of 6

fields each rule reads, and whether the log carries them
  cap reads amount : present in 0 of 6 log entries
  tier reads tier : present in 0 of 6 log entries
```

**Re-derivability is computed, not asserted** — a rule declares which fields it
reads and a record supports re-derivation when it carries all of them, which is
why these numbers could have come out any way at all.

**The rule is wrong, and only one record can show it:**

```
decisions that disagree with the policy, searched from the raw events
  request 5 amount 500 : logged approve, policy says refer
  total: 1

the same search, from the decision log
  entries that could even be checked : 0 of 6
  defects found                      : 0
```

The log's 0 is not a clean bill of health. It is the number of questions that
could be asked.

```
questions the decision log answers
  which request      : 6 of 6
  what was decided   : 6 of 6
  whether it was right : 0 of 6

how close each capped decision was to changing
  request 5 amount 500 : margin 0
  decisions sitting exactly on the boundary : 1
  margins recoverable from the decision log : 0 of 6
```

A margin of zero is where a rule is actually decided, and the log has no
margins.

**Related.** [state-from-events-vs-stored](../state-from-events-vs-stored/) asks
whether a stored state matches what the events imply — a question about
agreement. This one asks whether the stored record can be *disagreed with at
all*.

A record of conclusions is a record of what a past version of the system
believed. Only a record of observations can disagree with it.

Verify it yourself:

```bash
pnpm eml run examples/the-record-says-what-was-decided/the_record_says_what_was_decided.eml
```
