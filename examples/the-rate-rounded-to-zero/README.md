# The rate rounded to zero

`the_rate_rounded_to_zero.eml` - The error rate reads zero per ten thousand and the arithmetic that produced it is exact. What resolution that unit has, against how rare the errors are, is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rate is computed honestly. It counts real failed requests, not a sample; the denominator is every request, not a subset; the division is integer and deterministic; and the figure is the same one the alert reads and the report prints.

The unit is per ten thousand, and thirty-seven errors in nine hundred thousand requests is finer than one part in ten thousand.

```
errors                          : 37
requests                        : 900000
error rate                      : 0 per ten thousand
  at a finer scale              : 4111 per hundred million
  which is one error every      : 24324 requests
alert fires at                  : 1 per ten thousand
alerts that fired               : 0
```

```
the error rate
  counts : real failed requests, not a sample
  denominator : every request
  division : integer, deterministic
  same figure : alert reads it and the report prints it
  errors miscounted : 0
  verdict : ZERO PER TEN THOUSAND
```

```
  one denominator over every request rather than a sampled
  subset is the part done right here, and it is why the
  rate is not a lucky window
```

```
the resolution of per-ten-thousand
  one unit of it : one error in ten thousand requests
  the actual rate : one error in 24324 requests
  finer than the unit by : about a factor of two and a
    half
  so int(errors * 10000 / requests) : truncates to 0
  what 0 per ten thousand reads as : no errors
```

```
the errors behind the zero
  errors that happened : 37
  what the rate says happened : none
  the same errors, per hundred million : 
    4111
  is the arithmetic wrong : no; the truncation is exact
  is zero the count : no; it is the count divided into a
    unit too coarse to hold it
```

```
null control - report a finer unit, alert on the count
  rate per ten thousand : 0, unchanged
  rate per hundred million : 4111
  alerts when the raw count is watched : 
    1
  no error and no request changed; the reported unit
  stopped being coarser than the thing it reports
```

```
what a zero error rate guarantees
  errors divided into ten thousand parts rounds below one
    part : exactly, real count over every request
  there were no errors : not addressed; the rate is
    int(errors * 10000 / requests) and 37 errors over 
    900000 truncates to 0 per ten thousand - the 37 errors
    are real; at a finer scale it is 4111 per hundred
    million
```

```
a rate is a count divided into a unit, and a unit coarser than the count rounds
it to nothing; zero at ten thousand is not the absence of errors, it is the
presence of fewer than the unit can name
```

It counts real failures over every request with an exact integer division - zero per ten thousand. That unit is coarser than one error in 24324 requests, so 37 real errors truncate to 0 and fire 0 alerts, while the same errors are 4111 per hundred million.

Verify it yourself:

```bash
pnpm eml run examples/the-rate-rounded-to-zero/the_rate_rounded_to_zero.eml
```
