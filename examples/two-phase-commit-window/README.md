# Two-Phase Commit — the in-doubt window

`two_phase_commit_window.eml` runs 2PC through a coordinator crash at every
point in the protocol, under three participant strategies for what to do
while in doubt: wait, presume-abort, presume-commit.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a distributed-systems case where the *correct*
implementation is the one that hangs. A participant that has voted YES and
lost the coordinator knows nothing about the outcome — the information is
not in its state, and no amount of local cleverness recovers it.

The measurement crashes the coordinator at each protocol point and records
each participant's final state under each strategy:

| strategy | split outcomes | blocked participant-cells |
| --- | --- | --- |
| wait | 0 | 14 |
| presume-abort | > 0 | 0 |
| presume-commit | > 0 | 0 |

Both non-blocking strategies trade a liveness problem for a correctness
one: some crash points leave one participant committed and another
aborted. The `wait` strategy never splits and blocks 14 participant-cells.

The check that matters most is the last one: **with no crash, all three
strategies agree 3/3** — which is the entire happy path, and the only path
most test suites exercise.

Verify it yourself:

```bash
pnpm eml run examples/two-phase-commit-window/two_phase_commit_window.eml
```

```bash
pnpm eml trace examples/two-phase-commit-window/two_phase_commit_window.eml --run
```
