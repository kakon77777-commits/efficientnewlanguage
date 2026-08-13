# Closed because it stopped being reported — 485 occurrences after closure, 0 reports

`closed_because_it_stopped_being_reported.eml` evaluates a "no reports for three
periods" closure rule against what the defect was actually doing.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the rule is sensible and cheap. It also measures
*reporting*, and reporting is a product of two things — how often the defect
happens, and how many people are positioned to notice. The rule reads their
product and attributes all of it to the first factor.

```
period   volume   occurrences   watchers   reports
  1        400      100           1          1
  2        440      110           1          1
  3        480      120           1          1
  4        520      130           0          0
  5        560      140           0          0
  6        600      150           0          0
  7        640      160           0          0
  8        700      175           0          0

the closure rule: no reports for 3 periods
  finding closed at period 6
```

**What the defect was doing at the moment of closure:**

```
  occurrences in the period it was closed : 150
  occurrences in the first period         : 100
  the defect was firing at least as often as when it was reported

before the closure : 600 occurrences, 3 reports
after the closure  : 485 occurrences, 0 reports
```

**Separating the two factors** — same traffic with the watching team still
present, and the watchers gone but the traffic genuinely halted:

```
the same periods, with the watching team still present
  occurrences : 1085
  reports     : 8

the same periods, with the traffic actually stopped
  occurrences : 0
  reports     : 0

what happened          : 1085 occurrences, 3 reports
what silence would mean if the defect had stopped : 0 occurrences
  the two are distinguishable, and reports alone cannot distinguish them
```

```
periods in which the defect occurred and nothing was filed
  silent periods : 5 of 8
  occurrences inside them : 755
  periods in which the defect did NOT occur : 0
```

Nothing is declared: occurrences are computed from the traffic and the defect
condition, reports from occurrences and who was watching, and the closure rule
is evaluated on the reports exactly as written.

An absence of reports has two explanations and the closure rule reads one.
Naming both before acting is the whole cost, and it is one sentence.

Verify it yourself:

```bash
pnpm eml run examples/closed-because-it-stopped-being-reported/closed_because_it_stopped_being_reported.eml
```
