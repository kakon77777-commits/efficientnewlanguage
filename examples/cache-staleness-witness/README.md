# Evicting the key you wrote is not enough

`cache_staleness_witness.eml` replays a write history against three cache-invalidation strategies and asks every question after every write.

**What it exercises**: per-key eviction feels complete. It is complete
for reads *named* by that key, and an aggregate — "which region has the
largest total" — is named by none of the keys it depends on. So the
entry that goes stale is the one whose name gives no hint it was
affected.

Measured: per-key eviction is right on **18/18** per-region questions
and **3/6** on the aggregate. Never-invalidate is wrong on both.
Versioning is right on everything, at the cost of dropping unrelated
entries.

Two EML-P boundaries surfaced while writing it. There is no `global`, so
assigning to a module-level name inside a function creates a local —
counters that must survive a call live in one-element lists. And there
is no `del`, while `dict.pop()` compiles but makes the interpreter
defer, so a function cannot remove an entry from a module-level
dictionary at all. Eviction here is a sentinel value, which is what a
cache looks like in a language without deletion.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  per-key evict right:    18/18
  versioned right:        18/18

leader probes:            6
  never-invalidate right: 3/6
  per-key evict right:    3/6
  versioned right:        6/6

checks passed: 5/5
Per-key eviction is right about the key it evicted and wrong about the aggregate.

Evicting the key you just wrote to is the fix that looks complete. It is
complete for reads NAMED by that key, and an aggregate is not named by any
of the keys it depends on - so the entry that goes stale is the one whose
name gives no hint that the write touched it. Correctness here is a
property of the dependency graph, not of the write.
```
