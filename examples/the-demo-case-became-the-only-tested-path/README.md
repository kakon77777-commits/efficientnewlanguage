# The demo case became the only tested path

`the_demo_case_became_the_only_tested_path.eml` - The example in the README is one shape of input. It is the shape 14 of 18 tests exercise.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The example was chosen well: it is short, it demonstrates the feature, and it is the first thing anyone runs. It became the shape everybody copies - into tests, into fixtures, into the mental model of what the input looks like - because it is the only concrete input the documentation contains.

Nothing about that is negligent. Writing tests from the example is faster and safer than inventing inputs, and the example is known to be valid.

Test coverage and real traffic are both counted per shape here, so the gap is measured against what the system actually receives.

```
input shapes : 5
  tests    : 18
  production defects : 19
```

```
shape                        traffic   tests   defects
  flat, all fields present   22%      14       1
  nested one level   31%      2       5
  optional fields missing   25%      1       6
  unicode in every field   14%      1       4
  empty collections   8%      0       3
```

```
the shape the README example uses : flat, all fields present
  its share of traffic : 22%
  its share of tests   : 77%
  its share of defects : 5%
```

```
every other shape, together
  traffic : 78%
  tests   : 4  (22%)
  defects : 18  (94%)
```

```
tests per point of traffic share
  flat, all fields present : 63
  nested one level : 6
  optional fields missing : 4
  unicode in every field : 7
  empty collections : 0
```

```
  most tested   : flat, all fields present (14 tests, 1 defects)
  most defects  : optional fields missing (1 tests, 6 defects)
  the tests worked where they were pointed, and they were pointed at the
  example rather than at the traffic
```

```
the shape with the fewest tests : empty collections
  its traffic share : 8%
  its defects       : 3
  documenting it costs one more example
```

```
control - a system whose example matches the traffic
  documented shape : 80% of traffic, 12 tests
  everything else  : 20% of traffic, 4 tests
  here copying the example points the tests at the traffic
```

The example is correct, valid and well chosen for teaching. It is also the only input anyone was handed, and a test suite is built from the inputs people have.

Verify it yourself:

```bash
pnpm eml run examples/the-demo-case-became-the-only-tested-path/the_demo_case_became_the_only_tested_path.eml
```
