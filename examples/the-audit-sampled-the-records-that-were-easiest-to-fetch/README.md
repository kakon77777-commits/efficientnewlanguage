# The audit sampled the records that were easiest to fetch

`the_audit_sampled_the_records_that_were_easiest_to_fetch.eml` - An audit sampled 500 of 50000 accounts and found a defect rate of 4 per thousand. What that rate is a rate of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The sample size was chosen properly, from a table, for a stated confidence level, and 500 is genuinely enough for a population of 50000. The auditor checked that. The sampling query was written to be fast because the audit runs nightly and a full scan would lock the table during the batch window - a real operational constraint, raised by the DBA, and respected. The query reads from the account cache, which is what every other read path in the system uses.

The cache holds accounts touched in the last 90 days. That is 12000 of the 50000. The other 38000 are dormant, and dormant is not a neutral property: an account is dormant because nobody has touched it, and nobody touching it is also why its address, its tax code and its consent flags were never migrated when the schema changed.

The sample is unbiased with respect to everything except the one attribute that determines whether a record is in the frame at all - and that attribute is correlated with the defect.

```
accounts            : 50000
  in cache, active  : 12000
  dormant           : 38000
sample size         : 500, drawn from the cache
```

```
the audit
  defects found in the sample : 2 of 500
  observed rate               : 4 per thousand
  extrapolated to 50000    : 200 defective accounts
```

```
stratum    accounts   rate per thousand   defects   in the sampling frame
  active     12000        4                  48       yes
  dormant    38000        60                 2280     no
  total      50000                            2328
```

```
  audit reported : 200
  actually there : 2328
  understated by a factor of 11
```

```
the estimate, judged against the population it actually sampled
  estimated rate in cache : 4 per thousand
  true rate in cache      : 4 per thousand
  error                   : 0 per thousand
  the sampling was correct; every step of it was correct
```

```
  what was wrong is one word in the sentence that reported it
  'we sampled accounts' should have read 'we sampled cached accounts'
```

```
the causal chain that makes the frame biased
  an account is cached because it was touched recently
  an account was migrated because someone touched it
  so cached implies touched implies migrated implies not defective
  the frame and the defect share a cause, which is the definition of a
  biased frame, and no sample size fixes it
```

```
  a larger sample from the same frame
    sample 5000 instead of 500 : 200 extrapolated
    ten times the work, the same wrong answer, with tighter confidence bounds
```

```
control - the same sample size drawn from the whole table
  sampled from active  : 120
  sampled from dormant : 380
  defects found        : 22
  extrapolated         : 2200
  actually there       : 2328
  cache-only frame was low by  : 91 percent
  whole-table frame is low by  : 5 percent
  the same 500 records of effort, and the frame is the only thing that changed
```

```
null control - the same cache-only frame, uniform defect rate across strata
  rate in both strata : 4 per thousand
  extrapolated from cache sample : 200
  actually there                 : 200
  difference                     : 0
  the same query, the same frame, and now it is a fine estimate
  so the rule is not 'do not sample from a cache'
  it is 'a frame is biased exactly as far as belonging to it predicts the
  answer'
```

```
what a sample size protects against
  random variation in the estimate      yes
  a frame that excludes part of the population   no
  a frame whose membership predicts the answer   no, and it makes it worse
  the confidence interval is computed from the sample size
  so a biased frame reports a tight interval around the wrong number
```

500 of 50000 is a correct sample size, the confidence level was chosen from a table, and reading from the cache avoided locking the table during the batch window - which the DBA had asked for. The rate that came back, 4 per thousand, is the true rate of cached accounts. 2328 accounts are defective, the audit reported 200, and 2280 of the defects were in records the query was written never to read.

Verify it yourself:

```bash
pnpm eml run examples/the-audit-sampled-the-records-that-were-easiest-to-fetch/the_audit_sampled_the_records_that_were_easiest_to_fetch.eml
```
