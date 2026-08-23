# Nobody filed an exception so the rule fits

`nobody_filed_an_exception_so_the_rule_fits.eml` - A coding standard has drawn two exception requests in eighteen months, and both were granted. What that low number measures is computed below, against what it is being read as measuring.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The standard is good. It was written after a real class of bug, it is specific, it has a rationale document, and the team that wrote it converted the existing code themselves rather than leaving it to everyone else. Two requests across eighteen months is what a well-fitted rule looks like, and granting both is what a reasonable owner looks like.

It is also what an expensive exception process looks like. An exception is filed by somebody weighing the cost of filing against the cost of complying, and where filing costs more, the rule fits by construction. The request count is a measurement of that threshold, not of the rule.

The cost of each path is computed below, per case.

```
cases where the rule applied : 8
cost of filing an exception  : 14 hours
```

```
case              comply (h)   file (h)   cheaper      filed?
  batch importer   3           14        comply       no
  legacy adapter   20           14        file       yes
  report builder   6           14        comply       no
  stream joiner   40           14        file       yes
  config loader   2           14        comply       no
  metrics shim   9           14        comply       no
  mail templater   5           14        comply       no
  auth cache   11           14        comply       no
```

```
exceptions filed : 2 of 8
cases where filing was the cheaper path : 2
  every case where filing was cheaper was filed, and no case where it
  was dearer was filed
  so the filing decision is fully explained by the 14-hour threshold
```

```
the cases that complied without filing
  batch importer : 3 hours, and it left a second parse of the same file
  report builder : 6 hours, and it left a duplicated struct
  config loader : 2 hours, and it left an extra allocation
  metrics shim : 9 hours, and it left a wrapper nobody reads
  mail templater : 5 hours, and it left two copies of one string table
  auth cache : 11 hours, and it left a lock held longer
  total complied cost : 36 hours
  exception requests these generated : 0
  the rule's record shows zero friction and the codebase shows 36 hours
  of it
```

```
the same eight cases with a 3-hour filing cost
  cases where filing becomes the cheaper path : 6 of 8
  hours of compliance work they represent    : 91
  requests the rule's owners would see       : 6, against 2 today
  none of those cases changed, and none of them are new
```

```
how many cases file, as the filing cost moves
  filing costs 2h : 7 of 8 would file
  filing costs 6h : 4 of 8 would file
  filing costs 10h : 3 of 8 would file
  filing costs 14h : 2 of 8 would file
  filing costs 20h : 1 of 8 would file
  filing costs 40h : 0 of 8 would file
  the rule did not change anywhere across that range
  the evidence about it moved from 7 requests to 0
  a rule is called well fitted on the strength of this number
```

```
the two that were filed
  legacy adapter : 20 hours to comply, 6 hours above the filing cost
  stream joiner : 40 hours to comply, 26 hours above the filing cost
  both were granted, so the rule's owners agreed the rule did not fit
  they are the two most expensive cases here, and the process selected
  them by expense rather than by fit
```

```
control - import ordering, 0 hours to comply
  filing cost : 14 hours
  cases where filing is cheaper : 0
  requests : 0
  here the zero is the same zero at any filing cost, so it carries
  information about the rule
```

The standard is well written and two requests in eighteen months is what a fitted rule looks like. It is also what a 14-hour filing cost looks like, and the 36 hours that complied quietly are in neither number.

Verify it yourself:

```bash
pnpm eml run examples/nobody-filed-an-exception-so-the-rule-fits/nobody_filed_an_exception_so_the_rule_fits.eml
```
