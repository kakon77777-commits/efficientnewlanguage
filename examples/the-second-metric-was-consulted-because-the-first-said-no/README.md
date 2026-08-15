# The second metric was consulted because the first said no - 7 of 8 launches have something to report, with no effect anywhere

`the_second_metric_was_consulted_because_the_first_said_no.eml` runs eight hypothetical launches in which the true effect is zero on every metric, and counts how often each rule finds something.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: consulting a second metric is not cheating. The first is a proxy with known weaknesses, and a team that stopped at one number would be criticised for it - correctly. Looking at engagement when conversion is flat is what a careful person does. The rule that emerges is "ship if any of them moved", and it is never written down as that.

```
launches : 8, metrics each : 5
  true effect in this data : 0 on every metric
```

```
launch   something to report
  1      conversion
  2      retention
  3      referrals
  4      conversion
  5      engagement
  6      revenue
  7      none
  8      conversion
```

```
how often each rule says ship
  pre-registered, conversion only : 3 of 8
  ship if any metric moved        : 7 of 8
```

```
how the rule grows with each metric added
  first 1 metric(s) : ships 3 of 8
  first 2 metric(s) : ships 4 of 8
  first 3 metric(s) : ships 5 of 8
  first 4 metric(s) : ships 6 of 8
  first 5 metric(s) : ships 7 of 8
```

```
launches where every metric was flat or down
  launch 7
  count : 1
```

```
control - a world where conversion really moved
  pre-registered rule ships : 3 of 3
  the single pre-registered metric catches it every time, with no help
```

Each metric is real, each look is reasonable, and none of them is the one that was promised. The number of metrics consulted is the fact that decides what the rule means, and it is the fact that does not appear in the writeup.

The **control** shows the pre-registered single metric catching a real effect 3 times out of 3, with no help from the others.

Verify it yourself:

```bash
pnpm eml run examples/the-second-metric-was-consulted-because-the-first-said-no/the_second_metric_was_consulted_because_the_first_said_no.eml
```
