# The vendor was audited and the subprocessor was not

`the_vendor_was_audited_and_the_subprocessor_was_not.eml` - Every vendor is audited annually, the reports are read rather than filed, and two vendors were rejected on the strength of it. How far the audit reaches is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The vendor review is not a checkbox. The audit report is read by someone who understands what its scope section excludes; the security questionnaire is answered by the vendor's engineers rather than returned by their sales team; the penetration test summary is requested and read; the data processing agreement names specific terms instead of incorporating a policy by reference; it is redone annually; and two vendors were turned down because of what it found.

The audit covers the party the contract is with. That party has its own subprocessors, listed in an appendix the agreement lets it change on thirty days' notice.

The notice goes to a shared mailbox.

```
vendors                         : 84
  audited this year             : 84
  rejected on the audit         : 2
```

```
subprocessors named in appendices : 310
  audited                       : 0
  not audited                   : 310
  share audited                 : 0 per ten thousand
```

```
contractual hops the audit covers : 1
hops the data travels             : 2
  beyond the audit                : 1
```

```
notice days for a change        : 30
changes notified last year      : 41
  annual churn                  : 1322 per ten thousand
objections raised               : 0
mailbox rules routing it to a person : 0
```

```
the vendor review
  the report : read, including what its scope excludes
  the questionnaire : answered by their engineers
  the penetration test summary : requested and read
  the agreement : specific terms, not a policy by
    reference
  cadence : annual
  vendors rejected because of it : 2
  verdict : AUDITED
```

```
  reading the scope section is the part that separates
  this from collecting certificates, and it is done
```

```
the scope of the review
  who it examines : the party the contract is with
  who processes the data : that party, and whoever it
    engages
  where those are listed : an appendix to the agreement
  what the agreement says about changing it : notice,
    30 days, not approval
  so the review reaches : 1 hop of 2
```

```
  the audit is complete over its population and the
  population is defined by who signed, not by who holds
```

```
the appendix
  exists and is accurate : yes
  maintained honestly by the vendor : yes
  names 310 parties : yes
  what it is : a disclosure
  what it is not : a review
  parties on it that were reviewed : 0
```

```
one notice
  sent by the vendor : yes, within the agreed window
  arrives where : a shared mailbox
  rules routing it to a person : 0
  changes notified last year : 41
  objections raised          : 0
  what a zero objection rate could mean : every change
    was acceptable, or none was read
  what distinguishes those : a record of a decision,
    which does not exist
```

```
the annual re-review
  vendors re-reviewed : 84
  what it re-examines : the same party
  subprocessor changes in the year : 41
  churn against the named set : 1322 per ten thousand
  does the re-review diff the appendix against last year :
    it is not a step in the review
```

```
null control - terms flow down and changes need approval
  vendors rejected on the audit : 2, unchanged
  subprocessors covered by the terms : 310
  hops the review covers : 2
  the audit did not get more rigorous; the obligation
  started travelling as far as the data
```

```
what a thorough vendor audit guarantees
  this vendor meets the standard : exactly, examined
    rather than certified, and 2 failed it
  the data is handled to that standard : not addressed;
    the audit follows the contract and the data follows
    the processing
```

```
diligence is bounded by privity; each hop is a party who
chose the next one, and an obligation that is not written to
flow down stops at the first signature while the data does
not
```

The review is the real kind: scope sections read, questionnaires answered by engineers, penetration summaries requested, specific terms rather than a policy by reference, annually, with 2 vendors rejected. It reaches 1 of 2 hops, so 310 of 310 named subprocessors are unexamined - 0 per ten thousand audited - and 41 changes arrived last year on notice, drawing 0 objections.

Verify it yourself:

```bash
pnpm eml run examples/the-vendor-was-audited-and-the-subprocessor-was-not/the_vendor_was_audited_and_the_subprocessor_was_not.eml
```
