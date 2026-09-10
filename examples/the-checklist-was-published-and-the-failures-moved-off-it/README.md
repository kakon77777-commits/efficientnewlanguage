# The checklist was published and the failures moved off it

`the_checklist_was_published_and_the_failures_moved_off_it.eml` - The internal audit checklist was published so teams could prepare, and findings per audit fell by three quarters in the two years since. What moved is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Publishing it was the right call and the audit is well run. An audit that surprises people measures preparation, not practice; the checklist is evidence-based, each item traceable to a real past incident; auditors rotate so no team is read by the same person twice; and a finding must cite the artifact it was found in rather than an opinion.

The checklist names sixty things. The audit looks for those sixty things.

```
audits a year                   : 64
items on the published checklist: 60
years since publication         : 2
items added since               : 0
```

```
findings, year before           : 1240
findings, last year             : 310
  that stopped being found      : 930
  remaining                     : 2500 per ten thousand
```

```
incidents, year before          : 54
  cause on the checklist        : 41
  cause off it                  : 13
  on-checklist share            : 7592 per ten thousand
incidents, last year            : 46
  cause on the checklist        : 19
  cause off it                  : 27
  on-checklist share            : 4130 per ten thousand
change in incidents             : -8
```

```
the internal audit
  the checklist : published, so an audit measures
    practice rather than surprise
  each item : traceable to a real past incident, not to
    an opinion
  the auditors : rotated, so no team is read twice by
    the same person
  a finding : must cite the artifact it was found in
  audits a year : 64
  verdict : AUDITED
```

```
  publishing the checklist is the right call, and
  requiring a finding to cite an artifact is the part
  almost nobody does
```

```
the sixty items, once they were known
  what a team can now do : fix exactly those sixty
    things before the auditor arrives
  findings that stopped being found : 
    930
  items added since publication : 
    0
  so the list a team prepares against : the same sixty,
    for two years
```

```
  the criteria became the target, and a target is met
  rather than exceeded
```

```
causes, before and after
  incidents whose cause was on the list, before : 
    41 of 54, 7592 per ten thousand
  incidents whose cause was on the list, last year : 
    19 of 46, 4130 per ten thousand
  so the checklist's own items : are genuinely being
    fixed, and that is a real result
  incidents whose cause was off the list : 
    13 before, 27 last year
  total incidents : -8
```

```
null control - spend a quarter of each audit off the list
  items added to the published list : 
    0, unchanged
  findings from the published items : 
    310, unchanged
  findings from the unannounced quarter : 
    118
  no team got worse; the auditor stopped only looking
  where the teams had been told to expect them
```

```
what a falling finding count guarantees
  the sixty published items are being done : exactly,
    64 audits a year, findings down to 
    2500 per ten thousand, and the incidents caused
    by those items fell with them
  the estate is safer : not addressed; the list has not
    moved in 2 years and incidents whose cause is off it
    went from 13 to 27
```

```
published criteria are a promise about where you will
look; a population that can read them improves exactly
there, and the measurement cannot distinguish that from
improving
```

The checklist is evidence-based, auditors rotate, findings must cite an artifact, and 930 findings stopped being found across 64 audits a year. The sixty items have not changed in 2 years: incidents caused by them fell from 41 to 19, incidents caused by anything else went 13 to 27, and the total moved by -8.

Verify it yourself:

```bash
pnpm eml run examples/the-checklist-was-published-and-the-failures-moved-off-it/the_checklist_was_published_and_the_failures_moved_off_it.eml
```
