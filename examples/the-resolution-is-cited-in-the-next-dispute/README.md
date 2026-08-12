# The resolution is cited in the next dispute — 5 decisions, 1 observation

`the_resolution_is_cited_in_the_next_dispute.eml` runs the same disputes under
two policies and counts how often each one actually looked at evidence.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the first dispute was resolved on thin evidence — not a
scandal, that was the evidence available. What happens next is the case: the
resolution is written down, and the next dispute of the same kind is settled by
citing it rather than by looking again.

```
decide on the evidence each time
  correct              : 7 of 10
  evidence consulted   : 10 times

follow the earliest decision of the same kind
  correct              : 5 of 10
  evidence consulted   : 3 times
  decided by citation  : 7 times
```

**The evidence kept improving and was never read again:**

```
  0 refund strength 1 : read
  2 refund strength 2 : not read
  4 refund strength 4 : not read
  6 refund strength 5 : not read
  8 refund strength 5 : not read
  disputes carrying decisive evidence that was never read : 4

the refund line
  decisions on this kind        : 5
  evidence behind all of them   : strength 1
  best evidence ever available  : strength 5
  observations behind the line  : 1
```

**And the policy delivers exactly what it promises.** Deciding the same question
the same way twice is called consistency, and a system that re-litigates every
settled question is unusable:

```
consistency: decisions of one kind that disagree with the earliest
  evidence-each-time : 4
  follow-precedent   : 0
```

Nothing is declared. Both policies run over the same disputes with the truth
carried alongside, and both the consultation count and the number of
observations behind the refund line are computed rather than stated.

**Where this round comes from.** Rounds 60-62 all stop at the moment a
disagreement is resolved wrongly. This round is what the resolution becomes: a
decision recorded next to the observation it came from can be reopened when the
observation improves; a decision recorded on its own *becomes* the observation.

Verify it yourself:

```bash
pnpm eml run examples/the-resolution-is-cited-in-the-next-dispute/the_resolution_is_cited_in_the_next_dispute.eml
```
