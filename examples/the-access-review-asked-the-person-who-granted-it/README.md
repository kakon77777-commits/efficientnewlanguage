# The access review asked the person who granted it

`the_access_review_asked_the_person_who_granted_it.eml` - Every entitlement is re-approved by its owner every quarter, eleven quarters running, and an entitlement nobody answers for is revoked automatically. Who the owner is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The process is enforced rather than requested. It runs in the identity tool, not in a spreadsheet; a reviewer who does not respond does not stall the quarter, because silence revokes; the definitions of each entitlement are shown next to it rather than assumed known; and one thousand two hundred and forty entitlements were actually removed last quarter.

The reviewer for an entitlement is the manager who asked for it.

```
entitlements                    : 46000
  not reviewed                  : 0
  approved in one bulk action   : 41000
  decided one at a time         : 5000
  bulk-approved                 : 8913 per ten thousand
quarters completed              : 11
```

```
reviewers                       : 380
  who requested it themselves   : 340
  reviewing somebody else's     : 40
  self-reviewing                : 8947 per ten thousand
median seconds per decision     : 2
  hours of deciding a quarter   : 25
```

```
revoked last quarter            : 1240
  by a reviewer saying no       : 90
  by silence                    : 1150
  revoked by a decision         : 19 per ten thousand
incidents on a recertified one  : 7
```

```
the quarterly recertification
  where it runs : the identity tool, not a spreadsheet
  silence : revokes, so a reviewer who does not answer
    cannot stall the quarter
  what a reviewer sees : the entitlement's definition
    beside it, not a code
  removed last quarter : 1240
  quarters completed : 11
  verdict : RECERTIFIED
```

```
  making silence revoke rather than stall is the part
  almost nobody does, and it is why the 1150
  came off without anyone chasing them
```

```
who is asked about each entitlement
  the reviewer : the manager who requested it
  what the question is : should this person still have
    what you asked for them to have
  so the judgement under review and the judgement doing
    the reviewing : the same person's
  reviewers reviewing somebody else's request : 
    40 of 380
  median time to decide : 2 seconds
```

```
  the control asks the requester to disagree with
  themselves, once a quarter, in bulk
```

```
the 1240 that came off
  because a reviewer looked and said no : 
    90
  because nobody answered : 1150
  so the mechanism that removed most of them : the
    absence of a reviewer, not the presence of one
  entitlements a reviewer looked at and kept : the rest
  incidents involving one of those : 
    7
```

```
null control - review somebody else's request
  entitlements reviewed : 46000, unchanged
  reviewers : 380, unchanged
  revoked by a reviewer saying no : 
    830
  nothing about the entitlements changed; the person
  answering stopped being the person answered about
```

```
what a completed recertification guarantees
  every entitlement was re-approved by its owner :
    exactly, 46000 of them, 11 quarters, 0 skipped
  every entitlement is still needed : not addressed; the
    owner is the person who asked for it, and 
    8913 per ten thousand were approved in one action
```

```
a review whose reviewer is the requester measures whether
the requester has changed their mind; the number that can
vary is what somebody else would have said, and nothing
here asks them
```

It runs in the identity tool, silence revokes rather than stalls, definitions are shown beside each entitlement, and 1240 came off last quarter. The reviewer is the manager who requested it - 8947 per ten thousand of reviewers - so 1150 of the 1240 went by nobody answering, 90 by somebody saying no, and 41000 were approved in a single click at 2 seconds a decision.

Verify it yourself:

```bash
pnpm eml run examples/the-access-review-asked-the-person-who-granted-it/the_access_review_asked_the_person_who_granted_it.eml
```
