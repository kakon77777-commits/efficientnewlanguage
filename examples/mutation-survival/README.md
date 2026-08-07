# Mutation survival — the test that runs the most lines checks the least

`mutation_survival.eml` runs one suite against three mutants of one function
and reports which tests kill which, alongside the coverage each test achieves.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: coverage measures which lines **ran**. A test that runs
every line and asserts nothing has 100% coverage.

```
mutant     killed by
boundary   -- SURVIVED --
sign       negative
band       happy-mid

mutants: 3, survivors: 1
mutation score: 66%
```

The suite reaches all four bands — full coverage by a deliberately generous
definition — and one mutant survives it anyway.

The `smoke` test reaches **4/4 bands** and kills **0** mutants. It is the
highest-coverage test in the suite and the weakest one: coverage and
discrimination are not merely different, they can point opposite ways.

The survivor moves the low/mid boundary from 10 to 9. One test at `classify(9)`
kills it and adds **no coverage at all**, because 9 sits in a band the suite
already reached — so a coverage report cannot ask for this test.

**A premise the measurement corrected**: the first boundary mutant returned
"mid" for everything at or above 9. That is not an off-by-one, it is a rewrite,
and the existing tests killed it immediately. A mutant that any test catches
measures nothing about the suite.

Verify it yourself:

```bash
pnpm eml run examples/mutation-survival/mutation_survival.eml
```
