# The two checks agreed and they shared a parser

`the_two_checks_agreed_and_they_shared_a_parser.eml` - Two validators, written by two teams for two entry points, agree on every input. What their agreement is evidence of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Having two is correct and it was a deliberate choice. The API path and the batch path accept the same documents, and a rule enforced in one and not the other is exactly how a bad record gets in through the quiet door. Two independent implementations also catch each other's mistakes, which is the whole argument for redundancy, and here it works: they disagree on real inputs and every disagreement has been a real defect in one of them.

Independence is a property of the whole path, not of the top of it. Both validators call the same parsing library, because it is the only parser for this format and writing a second one would be worse in every way anybody could name.

Whatever the parser decides before either validator runs, both of them inherit, and agreement about an inherited premise is not a second opinion.

```
documents checked        : 240000
validators               : 2
rule classes             : 8
```

```
the two validators, measured against each other
  documents where they agree    : 240000
  documents where they disagree : 0
  agreement rate                : 100 percent
```

```
  which is read as: two independent checks confirm each other
```

```
where each rule class is decided
  classes with two separate implementations : 3
  classes decided by the shared parser      : 5
```

```
  share of the rules that two minds looked at : 37 percent
  share where agreement is arithmetic         : 63 percent
```

```
documents containing a duplicated key
  rate                     : 31 per ten thousand
  count                    : 744
  seen by validator one    : the normalised form
  seen by validator two    : the normalised form
  seen by either as sent   : 0
```

```
  both accept, both are right about what they were handed,
  and the document that reaches storage is the one they
  were not shown
```

```
for the two to disagree about this class
  they would need different parsers   : they have one
  or one would parse and one would not: neither can
  or the rule would have to run on bytes : it runs on the tree
```

```
  so a disagreement here is not unlikely, it is unreachable,
  and 0 disagreements is the only value this can ever report
```

```
the 3 classes with separate implementations
  disagreements found to date : 7
  of those, a real defect     : 7
  false alarms                : 0
```

```
  redundancy is doing exactly what it was added for,
  on the 37 percent of the surface where it exists
```

```
control - is either validator wrong
  incorrect accepts against its own input : 0
  incorrect rejects                       : 0
  rules implemented but not enforced      : 0
  defects in either validator             : 0
```

```
  neither one needs fixing; what needs stating is which
  fraction of the rules their agreement covers
```

```
null control - one validator reading the bytes instead
  classes now decided independently : 8
  documents where they disagree     : 744
  agreement rate                    : 100 percent, and lower is the finding
  the checks did not improve; the shared premise was removed
```

```
what two checks agreeing establishes
  they agree about their inputs      : yes, exactly
  they received the same input       : usually assumed
  they reached it by separate routes : only where the routes
    are actually separate, which is not where the code is
    separate but where the DATA path is
```

```
the question is not how many checks there are, it is how far
back they share a step; count the rules whose answer is fixed
before either check runs
```

The two validators agree on all 240000 documents with 0 disagreements, and on the 3 rule classes they implement separately that redundancy has caught 7 real defects with 0 false alarms. The other 5 classes - 63 percent - are settled by one shared parser before either validator runs, so on the 744 documents with a duplicated key both accept the normalised form, and a disagreement there is not improbable but unreachable.

Verify it yourself:

```bash
pnpm eml run examples/the-two-checks-agreed-and-they-shared-a-parser/the_two_checks_agreed_and_they_shared_a_parser.eml
```
