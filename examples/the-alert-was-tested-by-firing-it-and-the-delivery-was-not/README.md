# The alert was tested by firing it and the delivery was not

`the_alert_was_tested_by_firing_it_and_the_delivery_was_not.eml` - Alert rules are tested rather than trusted: a synthetic metric is injected, the rule is expected to fire, and a rule that does not fire fails the build. Where the test stops is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The practice is a real one. The test injects a series through the same evaluation engine production uses rather than a mock of it; it asserts the firing rather than the absence of an error; it runs on every change to a rule and nightly besides; and seventy-four rules have been fixed because it went red on them.

It asserts that the rule fires. Between a rule firing and a person waking up there are three more hops, and the test does not cross them.

```
alert rules                     : 640
  with an automated firing test : 612
  without one                   : 28
  tested share                  : 9562 per ten thousand
test firings a month            : 1224
months the practice has run     : 18
rules fixed because it went red : 74
```

```
steps from condition to a person: 5
  the test exercises            : 2
  nothing exercises             : 3
  path covered                  : 4000 per ten thousand
tests that page a real device   : 0
```

```
pages raised last quarter       : 318
  that reached a phone          : 296
  that reached nobody           : 22
  delivered                     : 9308 per ten thousand
    nobody rostered             : 9
    integration token expired   : 5
    silenced by do not disturb  : 8
```

```
the alert-rule test
  engine : the same evaluation engine production uses,
    not a mock of it
  assertion : that the rule fires, not that nothing
    errored
  cadence : on every change to a rule, and nightly
  rules fixed because it went red : 74
  months in place : 18
  verdict : FIRES
```

```
  asserting the firing rather than the absence of an
  error is the part almost nobody does, and it is why
  the 74 were found before an incident
```

```
the path from a condition to a person
  1 the condition holds : exercised
  2 the rule fires : exercised
  3 the notifier accepts it : not exercised
  4 the schedule says who : not exercised
  5 the device rings : not exercised
  steps covered : 2 of 5, 4000 per ten
    thousand
```

```
  the boundary of the test is the boundary of the system
  it was written for, and the question crosses it
```

```
a page that woke nobody
  did the condition hold : yes
  did the rule fire : yes, and the test says it always
    will
  did anything record a failure : no; delivery is
    accepted asynchronously and nothing reads the result
  where it stopped : 9 at an empty rota, 
    5 at an expired token, 8 at a silent phone
  pages in that state : 22 of 318
```

```
null control - page a real device and require the ack
  rules fixed by the firing test : 74, unchanged
  steps the test exercises : 5
  delivery failures found before an incident : 22
  the rules did not get better; the assertion was moved
  to the end of the path instead of the end of the
  component
```

```
what a fully tested alert set guarantees
  every rule fires when its condition holds : exactly,
    612 of 640 rules, 1224 firings a month, 18 months
  somebody is woken : not addressed; the test ends where
    the alerting system does, 3 hops short of a phone
```

```
a test that ends at a component boundary is evidence about
that component; the promise is about a person, and the
part between them is exercised only by real incidents
```

The firing test runs the production evaluation engine, asserts the firing rather than the absence of an error, and has fixed 74 rules in 18 months. It covers 2 of the 5 steps to a person - 4000 per ten thousand - so 22 of 318 pages last quarter reached nobody, across 0 tests that page a device.

Verify it yourself:

```bash
pnpm eml run examples/the-alert-was-tested-by-firing-it-and-the-delivery-was-not/the_alert_was_tested_by_firing_it_and_the_delivery_was_not.eml
```
