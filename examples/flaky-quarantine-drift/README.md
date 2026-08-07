# Flaky quarantine drift — a green pipeline and a third of the gate gone

`flaky_quarantine_drift.eml` runs the quarantine process week by week and
records three quantities: the active suite's pass rate, the number of active
tests, and the number of **defects the active suite would still catch**.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: quarantining is the right call for any single flaky test
and has no stopping condition.

| week | active tests | suite pass rate | defects still gated |
| --- | --- | --- | --- |
| 0 | 6 | 46.7% | 18/18 |
| 4 | 2 | **99.0%** | **4/18** |

The pass rate rises or holds on every single step and the defects gated fall on
every single step. Every week is an improvement by the reported number and a
regression by the unreported one, and nothing in the code changed.

The quarantined tests are not a random sample: **3 of 4** of them gated three or
more defects each. A test is flaky because it touches something real, so the
flakiest tests are the ones carrying the most.

The metric that would stop the process — how much of the system is still gated
— is a property of the tests that **left**, and nothing in a green pipeline
reports on those. The one on the dashboard is computed over the tests that
remain, so quarantining improves it by construction.

Verify it yourself:

```bash
pnpm eml run examples/flaky-quarantine-drift/flaky_quarantine_drift.eml
```
