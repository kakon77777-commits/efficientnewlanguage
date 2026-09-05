# The consent was recorded and the purpose was not

`the_consent_was_recorded_and_the_purpose_was_not.eml` - Consent is recorded for every subject, versioned, timestamped and revocable, and an audit sample reconciled completely. How much processing it covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The consent record is well built. Each one stores the exact text that was shown, the version of that text, the timestamp, and the interface it was given through; revocation is a first-class operation that propagates to the store in a median of nine seconds; and an external auditor sampled two hundred records and reconciled all two hundred against the subject's own account history.

What the record establishes is that the subject AGREED. Whether a particular read of that data is something they agreed to is a different proposition, and it needs the purpose of the read, which no read carries.

Thirty-one systems read this data and four purposes were declared.

```
consent records                 : 1840000
versions of the consent text    : 7
records sampled by the auditor  : 200
  of those, reconciled          : 200
revocation propagates in, seconds : 9
```

```
purposes declared at collection : 4
systems reading this data       : 31
  purpose among the declared    : 19
  outside them                  : 12
reads carrying a purpose        : 0
share of readers outside        : 3870 per ten thousand
```

```
the consent capture
  stores the exact text shown : yes, with its version
  stores when and through what interface : yes
  revocation : a first-class operation, propagating in
    about 9 seconds
  external audit sample : 200
  of those reconciled against the subject's own history : 200
  verdict : RECORDED
```

```
  storing the shown text and its version, rather than a
  boolean, is the expensive choice and the right one
```

```
one consent record
  the proposition it proves : this subject agreed to this
    text on this date
  the proposition an access needs : this read is for a
    purpose that text covers
  what joins the two : the purpose of the read
  where the purpose of a read is stored : nowhere; a read
    is a query for rows
```

```
  the record is complete about the act of agreeing and
  silent about what the data is then used for
```

```
the check performed at read time
  asks     : does this subject have live consent
  answers  : correctly, from the record
  does not ask : what this caller is about to do
  callers that could answer it : all of them
  callers that are asked       : 0
```

```
how a reader ends up outside the four
  a new system needs the data : it asks for access
  the approver checks         : that consent exists
  that check passes           : because it does exist
  the declared purposes       : 4, written at collection
  systems now reading         : 31
  approvals that compared the two : none required one
```

```
null control - every read carries its purpose
  records sampled and reconciled : 200, unchanged
  readers declaring a purpose    : 31
  readers refused or sent for re-consent : 12
  the consent record did not improve; the second operand
  of the comparison started existing
```

```
what a complete consent record guarantees
  the subject agreed, to this text, on this date : exactly,
    and better than a boolean ever could
  this processing is covered by that agreement   : not
    addressed; that is a claim about two things, and the
    system stores one of them
```

```
consent is a relation between a subject and a purpose; a
record that stores only the subject makes the lawful-basis
question look answered by a lookup that cannot fail
```

Consent is captured properly: the exact text and its version, the timestamp, the interface, revocation propagating in 9 seconds, and 200 of 200 audited records reconciling against the subject's own history. It records that the subject agreed and not what the data is used for, so of the 31 systems reading it, 12 - 3870 per ten thousand - are outside the 4 declared purposes, and 0 reads carry a purpose for the check to compare against.

Verify it yourself:

```bash
pnpm eml run examples/the-consent-was-recorded-and-the-purpose-was-not/the_consent_was_recorded_and_the_purpose_was_not.eml
```
