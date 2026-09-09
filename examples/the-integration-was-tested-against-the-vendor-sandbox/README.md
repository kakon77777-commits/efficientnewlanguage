# The integration was tested against the vendor sandbox

`the_integration_was_tested_against_the_vendor_sandbox.eml` - The payment integration has three hundred and forty tests that run against the vendor's sandbox on every commit, and they cover the vendor's documented error codes rather than our own wrapper. Which counterparty answers them is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The suite is well built. It asserts on the vendor's own error codes rather than on the exception types our client library invents; it runs on every commit rather than nightly, so a break is attributed to one change; it covers the failure codes and not only the success path; and it has been maintained for twenty-nine months rather than written once.

It talks to the sandbox. The sandbox is operated by the vendor and is not the vendor.

```
tests against the sandbox       : 340
suite runs a month              : 610
months of the practice          : 29
tests that run against the vendor : 0
```

```
documented error codes          : 46
  the sandbox can produce       : 44
  it cannot                     : 2
undocumented codes production sent : 4
codes production can return     : 50
  no test has ever seen         : 6
  covered                       : 8800 per ten thousand
```

```
rate limit, sandbox, per second : 0
rate limit, production          : 25
id characters, sandbox          : 12
id characters, production       : 26
our column width                : 20
  headroom the sandbox showed   : 8
  overflow the vendor sends     : 6
incidents from an unseen response : 3
```

```
the integration suite
  what it asserts on : the vendor's own error codes, not
    the exception types our client library invents
  when it runs : every commit, so a break belongs to one
    change
  what it covers : the failure codes, not only the
    success path
  runs a month : 610, for 29 months
  verdict : COVERED
```

```
  asserting on the vendor's codes rather than on our own
  wrapper is the part almost nobody does, and it is why
  the 340 tests survive a client-library upgrade
```

```
two counterparties
  who the tests talk to : the sandbox, operated by the
    vendor
  who production talks to : the vendor
  codes the sandbox can produce : 
    44
  codes production can return : 50
  so codes no test has ever seen : 
    6
  tests that talk to the vendor : 
    0
```

```
  the suite is complete against the thing it questions,
  and the thing it questions was built to be easy to
  question
```

```
the shape of an answer
  identifier length, sandbox : 
    12 characters
  our column : 20 characters, 
    8 to spare against the sandbox
  identifier length, production : 
    26 characters
  so the real identifier overflows by : 
    6 characters
  rate limit the tests ever met : 
    0 per second
  incidents from a response no test can produce : 
    3
```

```
null control - run it against the vendor, with real money
  tests : 340, unchanged
  codes a test can now see : 50
  id characters the tests see : 26
  rate limit the tests meet : 25 per second
  the assertions did not improve; they were pointed at
  the counterparty the promise is about
```

```
what a green integration suite guarantees
  every documented error the sandbox can produce is
    handled : exactly, 340 tests, 610 runs a month,
    29 months
  every response the vendor sends is handled : not
    addressed; 6 codes, one identifier length and one
    rate limit have never reached a test
```

```
a test double built by the counterparty is still a test
double; it is easier to answer than the thing it stands
for, and the ways it is easier are the ways nothing is
checked
```

The suite asserts on the vendor's own codes, runs on every commit, and has been maintained 29 months at 610 runs a month. It talks to the sandbox, which can produce 44 of the 50 codes production returns - 8800 per ten thousand - and returns identifiers 12 characters long against 26, which overflows our column by 6 across 0 tests that ask the vendor.

Verify it yourself:

```bash
pnpm eml run examples/the-integration-was-tested-against-the-vendor-sandbox/the_integration_was_tested_against_the_vendor_sandbox.eml
```
